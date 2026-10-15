import mongoose, { Schema, type InferSchemaType } from "mongoose";

const cardDesignSchema = new Schema(
  {
    theme: { type: String, enum: ["sunset", "ocean", "midnight"], required: true },
    stickers: {
      type: [String],
      enum: ["sparkles", "fire", "party", "heart", "star"],
      default: [],
    },
  },
  { _id: false },
);

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Music", "Workshop", "Food", "Sports", "Kids"],
      required: true,
    },
    city: { type: String, required: true, trim: true },
    dateTime: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    remindedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    cardDesign: { type: cardDesignSchema, default: null },
  },
  { timestamps: true },
);

export type EventData = InferSchemaType<typeof eventSchema>;

const Event =
  mongoose.models.Event || mongoose.model("Event", eventSchema);

export default Event;
