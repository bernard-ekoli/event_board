import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/connnect_db";
import Event from "@/app/schema/events";

export async function GET() {
  try {
    await connectToDatabase();
    const cities = await Event.distinct("city", { isActive: true });
    return NextResponse.json({
      cities: cities.filter((city): city is string => typeof city === "string").sort(),
    });
  } catch (error) {
    console.error("Error loading event cities:", error);
    return NextResponse.json(
      { message: "Could not load event cities." },
      { status: 500 },
    );
  }
}
