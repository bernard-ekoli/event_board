"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AdminShell,
  Spinner,
  Toast,
  categories,
  errorMessage,
  isAuthError,
  type AdminCategory,
} from "@/components/admin-header";
import { createAdminEvent } from "@/lib/api";

const initial = {
  title: "",
  category: "Music" as AdminCategory,
  city: "",
  dateTime: "",
  price: "",
  description: "",
  imageUrl: "",
};
type FormState = typeof initial;
type Errors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): Errors {
  const errors: Errors = {};
  if (!form.title.trim()) errors.title = "Title is required";
  if (!categories.includes(form.category))
    errors.category = "Choose a category";
  if (!form.city.trim()) errors.city = "City is required";
  if (!form.dateTime) errors.dateTime = "Date and time are required";
  if (!form.price || Number(form.price) < 0)
    errors.price = "Price must be 0 or more";
  if (!form.description.trim()) errors.description = "Description is required";
  if (!form.imageUrl.trim()) errors.imageUrl = "Image URL is required";
  return errors;
}

export default function NewAdminEventPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setError("");
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      await createAdminEvent({
        title: form.title.trim(),
        category: form.category,
        city: form.city.trim(),
        dateTime: new Date(form.dateTime).toISOString(),
        price: Number(form.price),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
      });
      setSuccess(true);
      window.setTimeout(() => router.push("/admin/events"), 700);
    } catch (err) {
      if (isAuthError(err)) {
        router.push("/admin/login");
        return;
      }
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }
  const fieldClass = (field: keyof FormState) =>
    `h-11 rounded-xl border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors[field] ? "border-destructive" : ""}`;
  return (
    <AdminShell>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Add event</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new event for the public events board.
        </p>
        <form
          onSubmit={submit}
          className="mt-8 flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
              Title
              <input
                className={fieldClass("title")}
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
              {errors.title && (
                <span className="text-xs font-normal text-destructive">
                  {errors.title}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Category
              <select
                className={fieldClass("category")}
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <span className="text-xs font-normal text-destructive">
                  {errors.category}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              City
              <input
                className={fieldClass("city")}
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
              {errors.city && (
                <span className="text-xs font-normal text-destructive">
                  {errors.city}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Date and time
              <input
                type="datetime-local"
                className={fieldClass("dateTime")}
                value={form.dateTime}
                onChange={(e) => update("dateTime", e.target.value)}
              />
              {errors.dateTime && (
                <span className="text-xs font-normal text-destructive">
                  {errors.dateTime}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Price{" "}
              <span className="font-normal text-muted-foreground">
                (rupees)
              </span>
              <input
                type="number"
                min="0"
                step="1"
                className={fieldClass("price")}
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
              />
              {errors.price && (
                <span className="text-xs font-normal text-destructive">
                  {errors.price}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
              Description
              <textarea
                className={`min-h-32 rounded-xl border bg-background px-3 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.description ? "border-destructive" : ""}`}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
              {errors.description && (
                <span className="text-xs font-normal text-destructive">
                  {errors.description}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
              Image URL
              <input
                type="url"
                className={fieldClass("imageUrl")}
                value={form.imageUrl}
                onChange={(e) => update("imageUrl", e.target.value)}
                placeholder="https://…"
              />
              {errors.imageUrl && (
                <span className="text-xs font-normal text-destructive">
                  {errors.imageUrl}
                </span>
              )}
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Live event preview"
                  className="mt-1 aspect-video max-h-56 w-full rounded-xl object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </label>
          </div>
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner />
                  Creating…
                </>
              ) : (
                "Create event"
              )}
            </Button>
          </div>
        </form>
      </div>
      {success && <Toast message="Event created successfully" tone="success" />}
    </AdminShell>
  );
}
