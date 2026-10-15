import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { AuthError, getCurrentUser } from "@/lib/auth";
import connectToDatabase from "@/lib/connnect_db";
import Event from "@/app/schema/events";

type RouteContext = { params: Promise<{ id: string }> };

async function updateReminder(context: RouteContext, add: boolean) {
  try {
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }
    const user = await getCurrentUser();
    await connectToDatabase();
    const event = await Event.findOneAndUpdate(
      { _id: id, isActive: true },
      add
        ? { $addToSet: { remindedBy: user._id } }
        : { $pull: { remindedBy: user._id } },
      { new: true },
    );
    if (!event) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }
    return NextResponse.json({ reminded: add });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }
    console.error("Error updating event reminder:", error);
    return NextResponse.json(
      { message: "Could not update your reminder." },
      { status: 500 },
    );
  }
}

export async function PUT(_req: Request, context: RouteContext) {
  return updateReminder(context, true);
}

export async function DELETE(_req: Request, context: RouteContext) {
  return updateReminder(context, false);
}
