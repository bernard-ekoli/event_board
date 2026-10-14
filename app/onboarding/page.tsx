"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Check,
  Loader2,
  Music,
  Wrench,
  Utensils,
  Trophy,
  Baby,
} from "lucide-react";
import { ApiError, getMe, updateFavourites, type Category } from "@/lib/api";
import { Button } from "@/components/ui/button";

const categories: { value: Category; icon: typeof Music }[] = [
  { value: "Music", icon: Music },
  { value: "Workshop", icon: Wrench },
  { value: "Food", icon: Utensils },
  { value: "Sports", icon: Trophy },
  { value: "Kids", icon: Baby },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    getMe()
      .then(({ user }) => setSelected(user.favouriteCategories || []))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) router.replace("/login");
        else setError("We couldn't load your interests.");
      })
      .finally(() => setLoading(false));
  }, [router]);
  function toggle(category: Category) {
    setSelected((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }
  async function save() {
    if (!selected.length) return;
    setSaving(true);
    setError("");
    try {
      await updateFavourites(selected);
      router.push("/feed");
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "We couldn't save your interests.",
      );
      setSaving(false);
    }
  }
  if (loading)
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/30 px-5 py-12">
      <section className="w-full max-w-2xl rounded-2xl border bg-card p-6 sm:p-8">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-semibold">
            Pick your favourite categories
          </h1>
          <p className="mt-2 text-muted-foreground">
            Choose at least one and we&apos;ll personalize your feed.
          </p>
        </header>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {categories.map(({ value, icon: Icon }) => {
            const active = selected.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggle(value)}
                aria-pressed={active}
                className={`relative flex min-h-32 flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 text-center transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"}`}
              >
                <Icon className="size-8" aria-hidden="true" />
                <span className="font-medium">{value}</span>
                {active && <Check className="absolute right-2 top-2 size-4" />}
              </button>
            );
          })}
        </div>
        {error && (
          <p role="alert" className="mt-5 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button
          onClick={save}
          disabled={!selected.length || saving}
          className="mt-6 w-full"
        >
          {saving && (
            <Loader2 className="animate-spin" data-icon="inline-start" />
          )}
          Save interests
        </Button>
      </section>
    </main>
  );
}
