import { NextRequest, NextResponse } from "next/server";
import { AuthError, getCurrentUser } from "@/lib/auth";
import { isCategory } from "@/lib/events";

export async function PUT(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    if (
      typeof body !== "object" ||
      body === null ||
      !("categories" in body) ||
      !Array.isArray(body.categories) ||
      body.categories.length === 0 ||
      !body.categories.every(isCategory)
    ) {
      return NextResponse.json(
        { message: "Choose at least one valid category." },
        { status: 400 },
      );
    }

    const user = await getCurrentUser();
    user.favouriteCategories = [...new Set(body.categories)];
    await user.save();

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        favouriteCategories: user.favouriteCategories,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }
    console.error("Error saving favourite categories:", error);
    return NextResponse.json(
      { message: "Could not save your interests." },
      { status: 500 },
    );
  }
}
