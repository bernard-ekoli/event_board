import { NextRequest, NextResponse } from "next/server";
import { AuthError, getCurrentUser } from "@/lib/auth";
import { getPaginatedEvents } from "@/lib/events";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const data = await getPaginatedEvents(
      {
        isActive: true,
        dateTime: { $gte: new Date() },
        category: { $in: user.favouriteCategories },
      },
      Number(req.nextUrl.searchParams.get("page") ?? "1"),
      Number(req.nextUrl.searchParams.get("limit") ?? "9"),
      user._id.toString(),
    );
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }
    console.error("Error loading personalized feed:", error);
    return NextResponse.json(
      { message: "Could not load your feed." },
      { status: 500 },
    );
  }
}
