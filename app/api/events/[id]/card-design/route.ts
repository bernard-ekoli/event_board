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
    const user = await getCurrentUser();
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

    await connectToDatabase();
    const designFilter = {
      _id: id,
      isActive: true,
      "cardDesigns.user": user._id,
    };
    const designUpdate = {
      $set: {
        "cardDesigns.$.theme": body.theme,
        "cardDesigns.$.stickers": body.stickers,
      },
    };

    const updated = await Event.updateOne(designFilter, designUpdate);
    if (updated.matchedCount === 0) {
      const added = await Event.updateOne(
        {
          _id: id,
          isActive: true,
          cardDesigns: { $not: { $elemMatch: { user: user._id } } },
        },
        {
          $push: {
            cardDesigns: {
              user: user._id,
              theme: body.theme,
              stickers: body.stickers,
            },
          },
        },
      );

      if (added.matchedCount === 0) {
        const updatedAfterInsert = await Event.updateOne(
          designFilter,
          designUpdate,
        );
        if (updatedAfterInsert.matchedCount === 0) {
          return NextResponse.json(
            { message: "Event not found." },
            { status: 404 },
          );
        }
      }
    }

    return NextResponse.json({
      cardDesign: { theme: body.theme, stickers: body.stickers },
    });
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
