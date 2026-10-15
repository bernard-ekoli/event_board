import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getSession();

  if (session?.role === "admin") {
    redirect("/admin/events");
  }

  redirect("/admin/login");
}
