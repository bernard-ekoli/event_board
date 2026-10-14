export function formatPrice(value: number) {
  if (value === 0) return "Free";
  return `₹${new Intl.NumberFormat("en-IN").format(value)}`;
}

export function formatEventDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}
