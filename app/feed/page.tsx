"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ApiError, getFeed, type EventItem, type Paginated } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { EventsGrid, EventsSkeletonGrid } from "@/components/event-card";

function FeedContent() {
  const router = useRouter();
  const params = useSearchParams();
  const page = Math.max(1, Number(params.get("page") || 1));
  const [data, setData] = useState<Paginated<EventItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(() => {
    setLoading(true);
    setError("");
    getFeed(page, 9)
      .then(setData)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) router.replace("/login");
        else setError("We couldn&apos;t load your feed. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [page, router]);
  useEffect(() => {
    load();
  }, [load]);
  function go(next: number) {
    router.push(`/feed?page=${next}`);
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Your picks
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">My Feed</h1>
          <p className="mt-2 text-muted-foreground">
            Upcoming events matched to your interests.
          </p>
        </div>
        <Link
          href="/onboarding"
          className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Edit interests
        </Link>
      </div>
      {loading ? (
        <EventsSkeletonGrid />
      ) : error ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-16 text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={load}>Retry</Button>
        </div>
      ) : data && data.items.length ? (
        <>
          <EventsGrid events={data.items} />
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => go(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {data.page} of {data.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= data.totalPages}
              onClick={() => go(page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-20 text-center">
          <h2 className="text-xl font-semibold">Nothing here yet.</h2>
          <p className="text-muted-foreground">
            Try picking more interests to find your next favourite event.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Pick interests
          </Link>
        </div>
      )}
    </main>
  );
}

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <EventsSkeletonGrid />
        </main>
      }
    >
      <FeedContent />
    </Suspense>
  );
}
