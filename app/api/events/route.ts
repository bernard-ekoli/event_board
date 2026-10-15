import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/connnect_db";
import Event from "@/app/schema/events";
import {
  getPaginatedEvents,
  isCategory,
  type EventFilter,
} from "@/lib/events";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const params = req.nextUrl.searchParams;
    const category = params.get("category");
    const city = params.get("city")?.trim();
    const query = params.get("q")?.trim();
    const filter: EventFilter = {
      isActive: true,
      dateTime: { $gte: new Date() },
    };
    if (category) {
      if (!isCategory(category)) {
        return NextResponse.json(
          { message: "Choose a valid category." },
          { status: 400 },
        );
      }
      filter.category = category;
    }
    if (city) filter.city = city;
    if (query) {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escapedQuery, $options: "i" } },
        { description: { $regex: escapedQuery, $options: "i" } },
      ];
    }

    const data = await getPaginatedEvents(
      filter,
      Number(params.get("page") ?? "1"),
      Number(params.get("limit") ?? "9"),
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error loading events:", error);
    return NextResponse.json(
      { message: "Could not load events." },
      { status: 500 },
    );
  }
}
