import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/auth";
import connectToDatabase from "@/lib/connnect_db";
import Event from "@/app/schema/events";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }
    const body: unknown = await req.json();
    if (
      typeof body !== "object" ||
      body === null ||
      !("isActive" in body) ||
      typeof body.isActive !== "boolean"
    ) {
      return NextResponse.json(
        { message: "Event status must be active or inactive." },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const event = await Event.findByIdAndUpdate(
      id,
      { isActive: body.isActive },
      { new: true },
    );
    if (!event) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }
    return NextResponse.json({ event: { id: event._id.toString(), isActive: event.isActive } });
  } catch (error) {
    console.error("Error updating event status:", error);
    return NextResponse.json(
      { message: "Could not update event status." },
      { status: 500 },
    );
  }
}
