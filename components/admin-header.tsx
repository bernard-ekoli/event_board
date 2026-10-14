"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/api";

export function AdminHeader() {
  const router = useRouter();
  async function handleLogout() {
    await logout().catch(() => undefined);
    router.push("/admin/login");
  }
  return (
    <div className="mb-8 flex items-center justify-between border-b pb-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Admin
        </p>
        <Link
          href="/admin/events"
          className="text-xl font-semibold tracking-tight"
        >
          Events management
        </Link>
      </div>
      <Button variant="outline" onClick={handleLogout}>
        <LogOut data-icon="inline-start" />
        Logout
      </Button>
    </div>
  );
}

export function isAuthError(error: unknown) {
  return (
    error instanceof Error &&
    "status" in error &&
    ((error as { status?: number }).status === 401 ||
      (error as { status?: number }).status === 403)
  );
}

export function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-5 py-10 sm:px-8">
      <AdminHeader />
      {children}
    </main>
  );
}

export function Toast({
  message,
  tone = "error",
}: {
  message: string;
  tone?: "error" | "success";
}) {
  return (
    <div
      role="status"
      className={`fixed bottom-5 right-5 z-50 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${tone === "success" ? "border-primary/30 bg-primary text-primary-foreground" : "border-destructive/30 bg-destructive text-destructive-foreground"}`}
    >
      {message}
    </div>
  );
}

export function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

export const categories = [
  "Music",
  "Workshop",
  "Food",
  "Sports",
  "Kids",
] as const;
export type AdminCategory = (typeof categories)[number];
