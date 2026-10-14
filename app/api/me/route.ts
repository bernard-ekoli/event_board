import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/connnect_db";
import User from "@/app/schema/users";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 },
      );
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("userId" in decoded) ||
      typeof decoded.userId !== "string"
    ) {
      return NextResponse.json(
        { message: "Invalid authentication token." },
        { status: 401 },
      );
    }

    await connectToDatabase();
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 401 },
      );
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        favouriteCategories: user.favouriteCategories ?? [],
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { message: "Invalid authentication token." },
        { status: 401 },
      );
    }

    console.error("Error loading current user:", error);
    return NextResponse.json(
      { message: "Could not load the current user." },
      { status: 500 },
    );
  }
}