"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ApiError, getMe, login, signUp } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const emailValid = /\S+@\S+\.\S+/.test(email);
  const passwordValid = password.length >= 8;
  const valid = emailValid && passwordValid;

  useEffect(() => {
    let active = true;

    getMe()
      .then(() => {
        router.replace("/feed");
      })
      .catch(() => {
        // No valid session; leave the user on the login or signup page.
      })
      .finally(() => {
        if (active) {
          setCheckingSession(false);
        }
      });

    return () => {
      active = false;
    };
  }, [router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!valid || checkingSession) return;
    setLoading(true);
    setError("");
    try {
      mode === "login"
        ? await login(email, password)
        : await signUp(email, password);
      router.push(mode === "login" ? "/feed" : "/onboarding");
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  }
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/30 px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-lg sm:p-8">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Sign in to see events picked for you."
              : "Save your interests and discover more nearby."}
          </p>
        </header>
        <form onSubmit={submit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              aria-invalid={email.length > 0 && !emailValid}
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {email.length > 0 && !emailValid && (
              <p className="text-sm text-destructive">
                Enter a valid email address.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              aria-invalid={password.length > 0 && !passwordValid}
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {password.length > 0 && !passwordValid && (
              <p className="text-sm text-destructive">
                Password must be at least 8 characters.
              </p>
            )}
          </div>
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={!valid || loading || checkingSession}
            className="w-full"
          >
            {loading && (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            )}
            {checkingSession
              ? "Checking session…"
              : mode === "login"
                ? "Log in"
                : "Sign up"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? "New here? " : "Already have an account? "}
            <Link
              className="font-medium text-primary hover:underline"
              href={mode === "login" ? "/signup" : "/login"}
            >
              {mode === "login" ? "Create an account" : "Log in"}
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  return <AuthForm mode={mode} />;
}
