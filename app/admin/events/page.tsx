"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getAdminEvents,
  setAdminEventActive,
  type EventItem,
  type Paginated,
} from "@/lib/api";
import { formatEventDate, formatPrice } from "@/lib/format";
import {
  AdminShell,
  Toast,
  Spinner,
  errorMessage,
  isAuthError,
} from "@/components/admin-header";

function StatusSwitch({
  event,
  onChange,
}: {
  event: EventItem;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={event.isActive}
      aria-label={`Set ${event.title} ${event.isActive ? "inactive" : "active"}`}
      onClick={() => onChange(!event.isActive)}
      className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${event.isActive ? "bg-primary" : "bg-muted"}`}
    >
      <span
        className={`absolute top-1 size-4 rounded-full bg-background shadow transition ${event.isActive ? "left-6" : "left-1"}`}
      />
    </button>
  );
}

export default function AdminEventsPage() {
  const [data, setData] = useState<Paginated<EventItem> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await getAdminEvents(page, 9));
    } catch (err) {
      if (isAuthError(err)) {
        window.location.href = "/admin/login";
        return;
      }
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page]);
  useEffect(() => {
    load();
  }, [load]);
  async function toggle(event: EventItem, value: boolean) {
    setData(
      (current) =>
        current && {
          ...current,
          items: current.items.map((item) =>
            item.id === event.id ? { ...item, isActive: value } : item,
          ),
        },
    );
    try {
      await setAdminEventActive(event.id, value);
    } catch (err) {
      setData(
        (current) =>
          current && {
            ...current,
            items: current.items.map((item) =>
              item.id === event.id
                ? { ...item, isActive: event.isActive }
                : item,
            ),
          },
      );
      if (isAuthError(err)) window.location.href = "/admin/login";
      else {
        setToast(errorMessage(err));
        window.setTimeout(() => setToast(""), 3200);
      }
    }
  }
  return (
    <AdminShell>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">All events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage visibility for every event.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Plus data-icon="inline-start" />
          Add event
        </Link>
      </div>
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
          <Button variant="outline" className="mt-4" onClick={load}>
            Retry
          </Button>
        </div>
      ) : !data?.items.length ? (
        <div className="rounded-2xl border p-12 text-center">
          <CalendarDays className="mx-auto size-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No events yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create the first event to see it here.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border">
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-medium">Event</th>
                    <th className="px-5 py-4 font-medium">Category</th>
                    <th className="px-5 py-4 font-medium">City</th>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 font-medium">Price</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.items.map((event) => (
                    <tr
                      key={event.id}
                      className={
                        !event.isActive
                          ? "bg-muted/30 text-muted-foreground"
                          : ""
                      }
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="size-12 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.style.visibility = "hidden";
                            }}
                          />
                          <span className="max-w-64 font-medium text-foreground">
                            {event.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">{event.category}</td>
                      <td className="px-5 py-4">{event.city}</td>
                      <td className="px-5 py-4">
                        {formatEventDate(event.dateTime)}
                      </td>
                      <td className="px-5 py-4">{formatPrice(event.price)}</td>
                      <td className="px-5 py-4">
                        <StatusSwitch
                          event={event}
                          onChange={(value) => toggle(event, value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col divide-y md:hidden">
              {data.items.map((event) => (
                <div
                  key={event.id}
                  className={`flex gap-3 p-4 ${!event.isActive ? "bg-muted/30" : ""}`}
                >
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="size-16 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.style.visibility = "hidden";
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{event.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.category} · {event.city}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatEventDate(event.dateTime)} ·{" "}
                      {formatPrice(event.price)}
                    </p>
                  </div>
                  <StatusSwitch
                    event={event}
                    onChange={(value) => toggle(event, value)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {data.page} of {data.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= data.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
      {toast && <Toast message={toast} />}
    </AdminShell>
  );
}
