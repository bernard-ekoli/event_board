"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, Sparkles } from "lucide-react";
import { ApiError, getMe, logout, type User } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { href: "/events", label: "Events" },
  { href: "/feed", label: "My Feed" },
];

export function SiteHeader() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    getMe()
      .then(({ user: current }) => setUser(current))
      .catch((error) => {
        if (!(error instanceof ApiError && error.status === 401)) setUser(null);
      });
  }, []);
  async function handleLogout() {
    await logout().catch(() => undefined);
    setUser(null);
    router.push("/events");
  }
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/events"
          className="flex items-center gap-2 text-base font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          Events Board
        </Link>
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Primary navigation"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <span
                className="max-w-44 truncate px-3 text-sm text-muted-foreground"
                title={user.email}
              >
                {user.email}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut data-icon="inline-start" />
                Logout
              </Button>
            </>
          ) : (
            <Link
              href="/login"
              className="ml-3 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Login / Signup
            </Link>
          )}
        </nav>
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation"
              />
            }
          >
            <Menu />
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Events Board</SheetTitle>
            </SheetHeader>
            <nav
              className="flex flex-col gap-2 px-4"
              aria-label="Mobile navigation"
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-3 text-base font-medium hover:bg-accent"
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <span className="truncate px-3 py-2 text-sm text-muted-foreground">
                  {user.email}
                </span>
              )}
              {user ? (
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut data-icon="inline-start" />
                  Logout
                </Button>
              ) : (
                <Link
                  href="/login"
                  className="mt-2 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                >
                  Login / Signup
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
