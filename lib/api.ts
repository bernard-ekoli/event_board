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
  token: string;
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

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: object;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getErrorMessage(data: unknown): string {
  if (typeof data === "object" && data !== null && "message" in data) {
    if (typeof data.message === "string") {
      return data.message;
    }
  }

  return "Something went wrong";
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(path, {
    method: options.method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(response.status, getErrorMessage(data));
  }

  return data as T;
}

interface QueryParams {
  category?: Category;
  city?: string;
  q?: string;
  page?: number;
  limit?: number;
}

function createQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();
  const entries = Object.entries(params);

  for (const [key, value] of entries) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }

  const queryString = searchParams.toString();

  if (queryString === "") {
    return "";
  }

  return `?${queryString}`;
}

// Authentication

export async function signUp(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: { email, password },
  });
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function logout(): Promise<{ ok: true }> {
  return request<{ ok: true }>("/api/auth/logout", {
    method: "POST",
  });
}

// User account

export async function getMe(): Promise<UserResponse> {
  return request<UserResponse>("/api/me");
}

export async function updateFavourites(
  categories: Category[],
): Promise<UserResponse> {
  return request<UserResponse>("/api/me/favourites", {
    method: "PUT",
    body: { categories },
  });
}

// Cities

export async function getCities(): Promise<CitiesResponse> {
  return request<CitiesResponse>("/api/cities");
}

// Events

export async function getEvents(
  params: QueryParams = {},
): Promise<Paginated<EventItem>> {
  return request<Paginated<EventItem>>(
    `/api/events${createQueryString(params)}`,
  );
}

export async function getEvent(id: string): Promise<EventResponse> {
  return request<EventResponse>(`/api/events/${encodeURIComponent(id)}`);
}

export async function getFeed(
  page?: number,
  limit?: number,
): Promise<Paginated<EventItem>> {
  return request<Paginated<EventItem>>(
    `/api/feed${createQueryString({ page, limit })}`,
  );
}

// Event reminders

export async function addReminder(
  id: string,
): Promise<{ reminded: true }> {
  return request<{ reminded: true }>(
    `/api/events/${encodeURIComponent(id)}/reminder`,
    {
      method: "PUT",
    },
  );
}

export async function removeReminder(
  id: string,
): Promise<{ reminded: false }> {
  return request<{ reminded: false }>(
    `/api/events/${encodeURIComponent(id)}/reminder`,
    {
      method: "DELETE",
    },
  );
}

// Event card design

export async function saveCardDesign(
  id: string,
  design: CardDesign,
): Promise<CardDesignResponse> {
  return request<CardDesignResponse>(
    `/api/events/${encodeURIComponent(id)}/card-design`,
    {
      method: "PUT",
      body: design,
    },
  );
}
