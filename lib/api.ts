// These types describe the data the frontend expects from the backend.

export type Category = "Music" | "Workshop" | "Food" | "Sports" | "Kids";

export interface EventItem {
  id: string;
  title: string;
  category: Category;
  city: string;
  dateTime: string;
  price: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
  reminded?: boolean;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface User {
  id: string;
  email: string;
  favouriteCategories: Category[];
}

export type CardTheme = "sunset" | "ocean" | "midnight";
export type CardSticker = "sparkles" | "fire" | "party" | "heart" | "star";

export interface CardDesign {
  theme: CardTheme;
  stickers: CardSticker[];
}

interface AuthResponse {
  user: User;
}

interface UserResponse {
  user: User;
}

interface CitiesResponse {
  cities: string[];
}

interface EventResponse {
  event: EventItem;
  cardDesign: CardDesign | null;
}

interface CardDesignResponse {
  cardDesign: CardDesign;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function sendRequest(
  url: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: object,
) {
  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const errorData: { message?: string } = await response.json();
      if (errorData.message) {
        message = errorData.message;
      }
    } catch {
      message = "Something went wrong";
    }

    throw new ApiError(response.status, message);
  }

  return response;
}

// Authentication

export async function signUp(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await sendRequest("/api/auth/signup", "POST", {
    email,
    password,
  });
  const data: AuthResponse = await response.json();
  return data;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await sendRequest("/api/auth/login", "POST", {
    email,
    password,
  });
  const data: AuthResponse = await response.json();
  return data;
}

export async function logout(): Promise<{ ok: true }> {
  const response = await sendRequest("/api/auth/logout", "POST");
  const data: { ok: true } = await response.json();
  return data;
}

// User account

export async function getMe(): Promise<UserResponse> {
  const response = await sendRequest("/api/me");
  const data: UserResponse = await response.json();
  return data;
}

export async function updateFavourites(
  categories: Category[],
): Promise<UserResponse> {
  const response = await sendRequest("/api/me/favourites", "PUT", {
    categories,
  });
  const data: UserResponse = await response.json();
  return data;
}

// Cities

export async function getCities(): Promise<CitiesResponse> {
  const response = await sendRequest("/api/cities");
  const data: CitiesResponse = await response.json();
  return data;
}

// Events

interface EventFilters {
  category?: Category;
  city?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export async function getEvents(
  filters: EventFilters = {},
): Promise<Paginated<EventItem>> {
  const params = new URLSearchParams();

  if (filters.category !== undefined)
    params.set("category", filters.category);
  if (filters.city !== undefined) params.set("city", filters.city);
  if (filters.q !== undefined) params.set("q", filters.q);
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));

  let url = "/api/events";
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await sendRequest(url);
  const data: Paginated<EventItem> = await response.json();
  return data;
}

export async function getEvent(id: string): Promise<EventResponse> {
  const response = await sendRequest(
    `/api/events/${encodeURIComponent(id)}`,
  );
  const data: EventResponse = await response.json();
  return data;
}

export async function getFeed(
  page?: number,
  limit?: number,
): Promise<Paginated<EventItem>> {
  const params = new URLSearchParams();

  if (page !== undefined) params.set("page", String(page));
  if (limit !== undefined) params.set("limit", String(limit));

  let url = "/api/feed";
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await sendRequest(url);
  const data: Paginated<EventItem> = await response.json();
  return data;
}

// Event reminders

export async function addReminder(
  id: string,
): Promise<{ reminded: true }> {
  const response = await sendRequest(
    `/api/events/${encodeURIComponent(id)}/reminder`,
    "PUT",
  );
  const data: { reminded: true } = await response.json();
  return data;
}

export async function removeReminder(
  id: string,
): Promise<{ reminded: false }> {
  const response = await sendRequest(
    `/api/events/${encodeURIComponent(id)}/reminder`,
    "DELETE",
  );
  const data: { reminded: false } = await response.json();
  return data;
}

// Event card design

export async function saveCardDesign(
  id: string,
  design: CardDesign,
): Promise<CardDesignResponse> {
  const response = await sendRequest(
    `/api/events/${encodeURIComponent(id)}/card-design`,
    "PUT",
    design,
  );
  const data: CardDesignResponse = await response.json();
  return data;
}

// Admin

export async function adminLogin(
  email: string,
  password: string,
): Promise<{ token: string }> {
  const response = await sendRequest("/api/admin/login", "POST", {
    email,
    password,
  });
  const data: { token: string } = await response.json();
  return data;
}

export async function getAdminEvents(
  page = 1,
  limit = 9,
): Promise<Paginated<EventItem>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  const response = await sendRequest(`/api/admin/events?${params.toString()}`);
  const data: Paginated<EventItem> = await response.json();
  return data;
}

export async function setAdminEventActive(
  id: string,
  isActive: boolean,
): Promise<{ event: { id: string; isActive: boolean } }> {
  const response = await sendRequest(
    `/api/admin/events/${encodeURIComponent(id)}`,
    "PATCH",
    { isActive },
  );
  const data: { event: { id: string; isActive: boolean } } =
    await response.json();
  return data;
}

export interface NewEvent {
  title: string;
  category: Category;
  city: string;
  dateTime: string;
  price: number;
  description: string;
  imageUrl: string;
}

export async function createAdminEvent(
  event: NewEvent,
): Promise<{ event: { id: string } }> {
  const response = await sendRequest("/api/admin/events", "POST", event);
  const data: { event: { id: string } } = await response.json();
  return data;
}
