import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { AuthError, getCurrentUser } from "@/lib/auth";
import connectToDatabase from "@/lib/connnect_db";
import Event from "@/app/schema/events";
import { isCardDesign } from "@/lib/events";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }
    const body: unknown = await req.json();
    if (!isCardDesign(body)) {
      return NextResponse.json(
        { message: "The card design is invalid." },
        { status: 400 },
      );
    }
    await getCurrentUser();
    await connectToDatabase();
    const event = await Event.findOneAndUpdate(
      { _id: id, isActive: true },
      { cardDesign: body },
      { new: true },
    );
    if (!event) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }
    return NextResponse.json({ cardDesign: event.cardDesign });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }
    console.error("Error saving event card design:", error);
    return NextResponse.json(
      { message: "Could not save the card design." },
      { status: 500 },
    );
  }
}
