import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { setAuthCookie, signToken } from "@/lib/auth";

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export async function POST(req: NextRequest) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be configured.");
      return NextResponse.json(
        { message: "Administrator login is not configured." },
        { status: 500 },
      );
    }

    const body: unknown = await req.json();
    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 },
      );
    }

    const { email, password } = body as {
      email?: unknown;
      password?: unknown;
    };
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { message: "Email and password must be strings." },
        { status: 400 },
      );
    }

    const validEmail = safeEqual(
      email.trim().toLowerCase(),
      adminEmail.trim().toLowerCase(),
    );
    const validPassword = safeEqual(password, adminPassword);
    if (!validEmail || !validPassword) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 },
      );
    }

    const token = signToken({ sub: "admin", role: "admin" });
    const response = NextResponse.json({ token });
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("Error during administrator login:", error);
    return NextResponse.json(
      { message: "Could not sign in as administrator." },
      { status: 500 },
    );
  }
}
