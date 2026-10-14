import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/connnect_db";
import bcrypt from "bcrypt";
import User from "@/app/schema/users";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";


export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();
    const duplicateUser = await User.findOne({ email });
    if (duplicateUser) {
      return NextResponse.json(
        { message: "User with this email already exists." },
        { status: 400 },
      );
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    const response = NextResponse.json(
      { "message": "User created successfully" },
      { status: 200 },
    );
    const cookieStore = await cookies();

    cookieStore.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return response;

  } catch (error) {
    console.error("Error during signup:", error);
    return NextResponse.json(
      { error: "An error occurred during signup." },
      { status: 500 },
    );
  }
}
