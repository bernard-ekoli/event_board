import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/connnect_db";
import User from "@/app/schema/users";
import { setAuthCookie, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body: unknown = await req.json();
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
    }
    const { email, password } = body as {
      email?: unknown;
      password?: unknown;
    };

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { message: "Email or password is incorrect." },
        { status: 401 },
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return NextResponse.json(
        { message: "Email or password is incorrect." },
        { status: 401 },
      );
    }

    const token = signToken({ sub: user._id.toString(), role: "user" });

    const response = NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          email: user.email,
          favouriteCategories: user.favouriteCategories ?? [],
        },
      },
      { status: 200 },
    );

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { message: "An error occurred during login." },
      { status: 500 },
    );
  }
}