import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/connnect_db";
import Event from "@/app/schema/events";
import { getCurrentUserOrNull } from "@/lib/auth";
import { toEventItem } from "@/lib/events";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }
    await connectToDatabase();
    const event = await Event.findOne({ _id: id, isActive: true });
    if (!event) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    const user = await getCurrentUserOrNull();
    const cardDesign = user
      ? event.cardDesigns.find(
          (design: {
            user: mongoose.Types.ObjectId;
            theme: string;
            stickers: string[];
          }) => design.user.toString() === user._id.toString(),
        )
      : null;

    return NextResponse.json({
      event: toEventItem(event, user?._id.toString()),
      cardDesign: cardDesign
        ? { theme: cardDesign.theme, stickers: cardDesign.stickers }
        : null,
    });
  } catch (error) {
    console.error("Error loading event:", error);
    return NextResponse.json(
      { message: "Could not load this event." },
      { status: 500 },
    );
  }
}
