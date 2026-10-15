import { NextResponse } from "next/server";
import { AuthError, getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        favouriteCategories: user.favouriteCategories ?? [],
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("Error loading current user:", error);
    return NextResponse.json(
      { message: "Could not load the current user." },
      { status: 500 },
    );
  }
}