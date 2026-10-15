import type { QueryFilter, Types } from "mongoose";
import Event, { type EventData } from "@/app/schema/events";
import type { Category, EventItem, Paginated } from "@/lib/api";

export const categories: Category[] = [
  "Music",
  "Workshop",
  "Food",
  "Sports",
  "Kids",
];

type EventRecord = EventData & { _id: Types.ObjectId };
export type EventFilter = QueryFilter<EventData>;

export function toEventItem(
  event: EventRecord,
  userId?: string,
): EventItem {
  return {
    id: event._id.toString(),
    title: event.title,
    category: event.category,
    city: event.city,
    dateTime: event.dateTime.toISOString(),
    price: event.price,
    description: event.description,
    imageUrl: event.imageUrl,
    isActive: event.isActive,
    reminded: userId
      ? event.remindedBy.some((id) => id.toString() === userId)
      : false,
  };
}

export async function getPaginatedEvents(
  filter: EventFilter,
  requestedPage: number,
  requestedLimit: number,
  userId?: string,
): Promise<Paginated<EventItem>> {
  const page = Number.isFinite(requestedPage)
    ? Math.max(1, Math.floor(requestedPage))
    : 1;
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(50, Math.max(1, Math.floor(requestedLimit)))
    : 9;
  const [events, total] = await Promise.all([
    Event.find(filter)
      .sort({ dateTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Event.countDocuments(filter),
  ]);

  return {
    items: events.map((event) => toEventItem(event, userId)),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && categories.includes(value as Category);
}

export function isCardDesign(value: unknown): value is {
  theme: "sunset" | "ocean" | "midnight";
  stickers: ("sparkles" | "fire" | "party" | "heart" | "star")[];
} {
  if (typeof value !== "object" || value === null) return false;
  if (!("theme" in value) || !("stickers" in value)) return false;
  const themes = ["sunset", "ocean", "midnight"];
  const stickers = ["sparkles", "fire", "party", "heart", "star"];
  return (
    typeof value.theme === "string" &&
    themes.includes(value.theme) &&
    Array.isArray(value.stickers) &&
    value.stickers.length <= 3 &&
    value.stickers.every(
      (sticker) => typeof sticker === "string" && stickers.includes(sticker),
    ) &&
    new Set(value.stickers).size === value.stickers.length
  );
}
