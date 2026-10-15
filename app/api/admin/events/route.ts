import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import connectToDatabase from "@/lib/connnect_db";
import Event from "@/app/schema/events";
import { getPaginatedEvents, isCategory } from "@/lib/events";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    await connectToDatabase();
    const params = req.nextUrl.searchParams;
    const data = await getPaginatedEvents(
      {},
      Number(params.get("page") ?? "1"),
      Number(params.get("limit") ?? "9"),
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error loading administrator events:", error);
    return NextResponse.json(
      { message: "Could not load events." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body: unknown = await req.json();
    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { message: "Invalid event details." },
        { status: 400 },
      );
    }
    const data = body as {
      title?: unknown;
      category?: unknown;
      city?: unknown;
      dateTime?: unknown;
      price?: unknown;
      description?: unknown;
      imageUrl?: unknown;
    };

    const title = typeof data.title === "string" ? data.title.trim() : "";
    const city = typeof data.city === "string" ? data.city.trim() : "";
    const description =
      typeof data.description === "string" ? data.description.trim() : "";
    const imageUrl =
      typeof data.imageUrl === "string" ? data.imageUrl.trim() : "";
    const dateTime =
      typeof data.dateTime === "string" ? new Date(data.dateTime) : null;
    let validImageUrl = false;
    try {
      const url = new URL(imageUrl);
      validImageUrl = url.protocol === "http:" || url.protocol === "https:";
    } catch {
      validImageUrl = false;
    }

    if (
      !title ||
      !isCategory(data.category) ||
      !city ||
      !dateTime ||
      Number.isNaN(dateTime.getTime()) ||
      typeof data.price !== "number" ||
      !Number.isFinite(data.price) ||
      data.price < 0 ||
      !description ||
      !validImageUrl
    ) {
      return NextResponse.json(
        { message: "Please enter valid details for every event field." },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const event = await Event.create({
      title,
      category: data.category,
      city,
      dateTime,
      price: data.price,
      description,
      imageUrl,
      isActive: true,
    });
    return NextResponse.json({ event: { id: event._id.toString() } }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { message: "Could not create the event." },
      { status: 500 },
    );
  }
}
