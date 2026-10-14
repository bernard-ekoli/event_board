"use client";

import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import type { EventItem } from "@/lib/api";
import { formatEventDate, formatPrice } from "@/lib/format";

export function EventCard({ event }: { event: EventItem }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="size-full object-cover transition duration-300 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.style.display = "none";
            event.currentTarget.parentElement?.classList.add(
              "event-image-fallback",
            );
          }}
        />
        <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
          {event.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h2 className="line-clamp-2 text-lg font-semibold tracking-tight group-hover:text-primary">
          {event.title}
        </h2>
        <div className="mt-auto flex flex-col gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <MapPin className="size-4" aria-hidden="true" />
            {event.city}
          </span>
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4" aria-hidden="true" />
            {formatEventDate(event.dateTime)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t pt-3">
          <span className="font-semibold text-foreground">
            {formatPrice(event.price)}
          </span>
          <span className="text-sm font-medium text-primary">View details</span>
        </div>
      </div>
    </Link>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="aspect-[16/10] animate-pulse bg-muted" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-5 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function EventImageFallbackStyles() {
  return (
    <style>{`.event-image-fallback::after { content: "Event image"; position: absolute; inset: 0; display: grid; place-items: center; color: hsl(var(--muted-foreground)); font-size: .875rem; }`}</style>
  );
}

export function EventsGrid({ events }: { events: EventItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export function EventsSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }, (_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
}
