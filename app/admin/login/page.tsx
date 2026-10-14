"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { adminLogin } from "@/lib/api";
import { Spinner, errorMessage } from "@/components/admin-header";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(email, password);
      router.push("/admin/events");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border bg-card p-7 shadow-sm sm:p-9">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Admin access
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Sign in to manage events
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use your administrator credentials to continue.
        </p>
        <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Email
            <input
              className="h-11 rounded-xl border bg-background px-3 font-normal outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Password
            <input
              className="h-11 rounded-xl border bg-background px-3 font-normal outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
        <Link
          href="/events"
          className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Back to events
        </Link>
      </div>
    </main>
  );
}
