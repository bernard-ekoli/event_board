"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, RefreshCw, Search, X } from "lucide-react";
import {
  EventImageFallbackStyles,
  EventsGrid,
  EventsSkeletonGrid,
} from "@/components/event-card";
import { getCities, getEvents, type Category, type EventItem } from "@/lib/api";

const categories: Category[] = ["Music", "Workshop", "Food", "Sports", "Kids"];
const pageSize = 9;

function EventsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = (searchParams.get("category") ?? "") as Category | "";
  const city = searchParams.get("city") ?? "";
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const [query, setQuery] = useState(q);
  const [cities, setCities] = useState<string[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => setQuery(q), [q]);

  useEffect(() => {
    let active = true;
    getCities()
      .then(({ cities }) => {
        if (active) setCities(cities);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setCitiesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) =>
        value ? next.set(key, value) : next.delete(key),
      );
      if (!("page" in updates)) next.set("page", "1");
      router.push(`${pathname}?${next.toString()}`);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (query !== q) updateFilters({ q: query });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [q, query, updateFilters]);

  const loadEvents = useCallback(() => {
    let active = true;
    setLoading(true);
    setError("");
    getEvents({
      category: category || undefined,
      city: city || undefined,
      q: q || undefined,
      page,
      limit: pageSize,
    })
      .then((result) => {
        if (active) {
          setEvents(result.items);
          setTotalPages(Math.max(1, result.totalPages));
        }
      })
      .catch(() => {
        if (active) setError("We couldn't load events right now.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [category, city, page, q]);

  useEffect(() => loadEvents(), [loadEvents]);

  const hasFilters = Boolean(category || city || q);
  const clearFilters = () => {
    setQuery("");
    router.push(pathname);
  };
  const pageLabel = useMemo(
    () => `Page ${page} of ${totalPages}`,
    [page, totalPages],
  );

  return (
    <>
      <EventImageFallbackStyles />
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Discover locally
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Explore events
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Find your next memorable experience, from live music to hands-on
            workshops.
          </p>
        </header>
        <section
          aria-label="Filter events"
          className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5"
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))_auto] lg:items-end">
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span>Search events</span>
              <span className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by title or description"
                  className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </span>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span>Category</span>
              <select
                value={category}
                onChange={(event) =>
                  updateFilters({ category: event.target.value })
                }
                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              <span>City</span>
              <select
                value={city}
                onChange={(event) =>
                  updateFilters({ city: event.target.value })
                }
                disabled={citiesLoading}
                className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">
                  {citiesLoading ? "Loading cities..." : "All cities"}
                </option>
                {cities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasFilters}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="size-4" aria-hidden="true" />
              Clear filters
            </button>
          </div>
        </section>
        {error ? (
          <div
            role="alert"
            className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
          >
            <p className="font-semibold">{error}</p>
            <button
              type="button"
              onClick={loadEvents}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Retry
            </button>
          </div>
        ) : loading ? (
          <EventsSkeletonGrid />
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-16 text-center">
            <h2 className="text-xl font-semibold">
              No events match your filters
            </h2>
            <p className="text-muted-foreground">
              Try a different search or clear your filters.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <EventsGrid events={events} />
            <nav
              aria-label="Pagination"
              className="flex items-center justify-center gap-4 pt-2"
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => updateFilters({ page: String(page - 1) })}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="min-w-24 text-center text-sm text-muted-foreground">
                {pageLabel}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => updateFilters({ page: String(page + 1) })}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </>
        )}
      </main>
    </>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-7xl px-5 py-14">
          <EventsSkeletonGrid />
        </main>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
