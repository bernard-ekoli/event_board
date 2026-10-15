import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/connnect_db";
import User from "@/app/schema/users";

export class AuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export interface Session {
  sub: string;
  role: "user" | "admin";
}

export function signToken(payload: Session) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return jwt.sign(payload, secret, { expiresIn: "24h" });
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
}

export async function getSession(req?: NextRequest): Promise<Session | null> {
  const token = req
    ? req.cookies.get("token")?.value
    : (await cookies()).get("token")?.value;
  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }
  let decoded: string | jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, secret);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return null;
    }
    throw error;
  }

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded.sub !== "string" ||
    (decoded.role !== "user" && decoded.role !== "admin")
  ) {
    return null;
  }

  return { sub: decoded.sub, role: decoded.role };
}

export async function requireAdmin(
  req: NextRequest,
): Promise<NextResponse | null> {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ message: "Not logged in" }, { status: 401 });
  }
  if (session.role !== "admin") {
    return NextResponse.json({ message: "Admins only" }, { status: 403 });
  }
  return null;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) {
    throw new AuthError(401, "You must be logged in.");
  }
  if (session.role !== "user") {
    throw new AuthError(403, "This action is for regular user accounts.");
  }

  await connectToDatabase();
  const user = await User.findById(session.sub);
  if (!user) {
    throw new AuthError(401, "User not found.");
  }

  return user;
}

export async function getCurrentUserOrNull() {
  try {
    return await getCurrentUser();
  } catch (error) {
    if (error instanceof AuthError) {
      return null;
    }
    throw error;
  }
}
