"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  Heart,
  Loader2,
  MapPin,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  ApiError,
  addReminder,
  getEvent,
  removeReminder,
  saveCardDesign,
  type CardDesign,
  type EventItem,
} from "@/lib/api";
import { formatEventDate, formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";

const themes: {
  name: CardDesign["theme"];
  label: string;
  className: string;
  textClass: string;
}[] = [
  {
    name: "sunset",
    label: "Sunset",
    className: "bg-gradient-to-br from-orange-400 via-rose-500 to-fuchsia-700",
    textClass: "text-white",
  },
  {
    name: "ocean",
    label: "Ocean",
    className: "bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-800",
    textClass: "text-white",
  },
  {
    name: "midnight",
    label: "Midnight",
    className: "bg-gradient-to-br from-slate-900 via-indigo-950 to-black",
    textClass: "text-white",
  },
];
const stickerOptions: {
  name: CardDesign["stickers"][number];
  emoji: string;
  label: string;
}[] = [
  { name: "sparkles", emoji: "✨", label: "Sparkles" },
  { name: "fire", emoji: "🔥", label: "Fire" },
  { name: "party", emoji: "🎉", label: "Party" },
  { name: "heart", emoji: "💖", label: "Heart" },
  { name: "star", emoji: "⭐", label: "Star" },
];
const defaultDesign: CardDesign = { theme: "sunset", stickers: [] };

function DetailSkeleton() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <div className="h-72 animate-pulse rounded-3xl bg-muted" />
      <div className="mt-8 flex max-w-3xl flex-col gap-4">
        <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-24 w-full animate-pulse rounded bg-muted" />
      </div>
    </main>
  );
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [design, setDesign] = useState<CardDesign>(defaultDesign);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reminded, setReminded] = useState(false);
  const [reminderSaving, setReminderSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    login?: boolean;
  } | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [canSaveDesign, setCanSaveDesign] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDesign = useRef(design);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    getEvent(id)
      .then(({ event: nextEvent, cardDesign }) => {
        setEvent(nextEvent);
        setReminded(Boolean(nextEvent.reminded));
        setDesign(cardDesign ?? defaultDesign);
        latestDesign.current = cardDesign ?? defaultDesign;
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) setError("not-found");
        else setError("We couldn’t load this event. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );

  function updateDesign(next: CardDesign) {
    setDesign(next);
    latestDesign.current = next;
    if (!canSaveDesign) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(() => {
      saveCardDesign(id, latestDesign.current)
        .then(() => setSaveStatus("saved"))
        .catch((e) => {
          if (e instanceof ApiError && e.status === 401)
            setCanSaveDesign(false);
          setSaveStatus("error");
        });
    }, 500);
  }

  async function toggleReminder() {
    if (reminderSaving || !event) return;
    const previous = reminded;
    setReminded(!previous);
    setReminderSaving(true);
    try {
      previous ? await removeReminder(id) : await addReminder(id);
    } catch (e) {
      setReminded(previous);
      setToast(
        e instanceof ApiError && e.status === 401
          ? { message: "Log in to save reminders.", login: true }
          : { message: "Could not save your reminder. Please try again." },
      );
      setTimeout(() => setToast(null), 5000);
    } finally {
      setReminderSaving(false);
    }
  }

  const activeTheme = useMemo(
    () => themes.find((theme) => theme.name === design.theme) ?? themes[0],
    [design.theme],
  );
  if (loading) return <DetailSkeleton />;
  if (error === "not-found")
    return (
      <main className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <h1 className="text-3xl font-semibold">Event not found</h1>
        <p className="mt-3 text-muted-foreground">
          This event may have been removed or is no longer available.
        </p>
        <Link
          href="/events"
          className="mt-6 inline-flex text-sm font-semibold text-primary"
        >
          Browse all events
        </Link>
      </main>
    );
  if (error || !event)
    return (
      <main className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <p className="text-destructive">
          {error || "We couldn’t load this event."}
        </p>
        <Button className="mt-5" onClick={load}>
          <RefreshCw data-icon="inline-start" />
          Retry
        </Button>
      </main>
    );

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      {toast && (
        <div
          role="alert"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border bg-card px-4 py-3 text-sm shadow-lg"
        >
          <span>{toast.message}</span>
          {toast.login && (
            <Link href="/login" className="font-semibold text-primary">
              Log in
            </Link>
          )}
          <button aria-label="Dismiss" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}
      <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="relative aspect-[16/7] min-h-56 overflow-hidden bg-muted">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="size-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <span className="absolute bottom-5 left-5 rounded-full bg-background/90 px-3 py-1 text-sm font-semibold">
            {event.category}
          </span>
        </div>
        <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_auto]">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              {event.title}
            </h1>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <MapPin data-icon="inline-start" />
                {event.city}
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays data-icon="inline-start" />
                {formatEventDate(event.dateTime)}
              </span>
              <span className="font-semibold text-foreground">
                {formatPrice(event.price)}
              </span>
            </div>
            <p className="mt-7 max-w-2xl whitespace-pre-line leading-7 text-muted-foreground">
              {event.description}
            </p>
          </div>
          <Button
            variant={reminded ? "secondary" : "default"}
            disabled={reminderSaving}
            onClick={toggleReminder}
            className="self-start"
          >
            {reminderSaving ? (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            ) : reminded ? (
              <Check data-icon="inline-start" />
            ) : (
              <Heart data-icon="inline-start" />
            )}
            {reminded ? "Reminder set" : "Remind me"}
          </Button>
        </div>
      </div>
      <section className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Make it yours
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Design your card</h2>
          <p className="mt-2 text-muted-foreground">
            Create a shareable keepsake for this event.
          </p>
          <div className="mt-7">
            <h3 className="text-sm font-semibold">Background</h3>
            <div className="mt-3 flex gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  aria-label={`${theme.label} theme`}
                  aria-pressed={design.theme === theme.name}
                  onClick={() => updateDesign({ ...design, theme: theme.name })}
                  className={`size-12 rounded-full ${theme.className} ring-offset-2 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${design.theme === theme.name ? "ring-2 ring-primary" : ""}`}
                />
              ))}
            </div>
          </div>
          <div className="mt-7">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Stickers</h3>
              <span className="text-sm text-muted-foreground">
                {design.stickers.length} of 3 used
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {stickerOptions.map((sticker) => {
                const used = design.stickers.includes(sticker.name);
                const disabled = used || design.stickers.length >= 3;
                return (
                  <button
                    key={sticker.name}
                    disabled={disabled}
                    aria-label={`Add ${sticker.label}`}
                    onClick={() =>
                      updateDesign({
                        ...design,
                        stickers: [...design.stickers, sticker.name],
                      })
                    }
                    className="rounded-xl border bg-card px-3 py-2 text-2xl transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    {sticker.emoji}
                  </button>
                );
              })}
            </div>
          </div>
          {!canSaveDesign && (
            <p className="mt-5 text-sm text-muted-foreground">
              Log in to save your design.
            </p>
          )}
          {canSaveDesign && saveStatus !== "idle" && (
            <p
              className={`mt-5 text-sm ${saveStatus === "error" ? "text-destructive" : "text-muted-foreground"}`}
            >
              {saveStatus === "saving" ? (
                "Saving..."
              ) : saveStatus === "saved" ? (
                "Saved"
              ) : (
                <>
                  Could not save ·{" "}
                  <button
                    className="font-semibold underline"
                    onClick={() => updateDesign(latestDesign.current)}
                  >
                    Retry
                  </button>
                </>
              )}
            </p>
          )}
        </div>
        <div
          className={`relative min-h-80 overflow-hidden rounded-3xl p-7 shadow-xl transition-colors duration-500 ${activeTheme.className} ${activeTheme.textClass}`}
        >
          <div className="relative flex h-full min-h-64 flex-col justify-between">
            <div className="flex flex-wrap gap-2">
              {design.stickers.map((name) => {
                const sticker = stickerOptions.find(
                  (item) => item.name === name,
                )!;
                return (
                  <span
                    key={name}
                    className="group relative animate-in fade-in zoom-in text-4xl"
                  >
                    <span>{sticker.emoji}</span>
                    <button
                      aria-label={`Remove ${sticker.label}`}
                      onClick={() =>
                        updateDesign({
                          ...design,
                          stickers: design.stickers.filter(
                            (item) => item !== name,
                          ),
                        })
                      }
                      className="absolute -right-2 -top-2 hidden size-5 rounded-full bg-black/60 text-xs group-hover:block"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
            <div>
              <p className="text-sm font-medium opacity-80">
                You’re invited to
              </p>
              <h3 className="mt-2 text-3xl font-bold leading-tight">
                {event.title}
              </h3>
              <div className="mt-5 flex flex-col gap-1 text-sm font-medium">
                <span>{formatEventDate(event.dateTime)}</span>
                <span>{event.city}</span>
              </div>
            </div>
            <Sparkles
              className="absolute bottom-0 right-0 size-20 opacity-20"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
