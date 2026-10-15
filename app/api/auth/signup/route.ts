import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/connnect_db";
import bcrypt from "bcrypt";
import User from "@/app/schema/users";
import { setAuthCookie, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }
    await connectToDatabase();
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
    if (
      typeof email !== "string" ||
      !/^\S+@\S+\.\S+$/.test(email.trim()) ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return NextResponse.json(
        { message: "Enter a valid email and a password of at least 8 characters." },
        { status: 400 },
      );
    }
    const normalizedEmail = email.trim().toLowerCase();
    const duplicateUser = await User.findOne({ email: normalizedEmail });
    if (duplicateUser) {
      return NextResponse.json(
        { message: "User with this email already exists." },
        { status: 400 },
      );
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ email: normalizedEmail, password: hashedPassword });
    await user.save();

    const token = signToken({ sub: user._id.toString(), role: "user" });

    const response = NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          email: user.email,
          favouriteCategories: user.favouriteCategories ?? [],
        },
      },
      { status: 201 },
    );
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("Error during signup:", error);
    return NextResponse.json(
      { message: "An error occurred during signup." },
      { status: 500 },
    );
  }
}
