# Community Events Board

A small app where an admin posts local events (music nights, workshops, food fairs) and visitors browse them, set reminders, and design a shareable card for each event.

**Live demo:** https://event-board-9fv6.vercel.app/
**Screen recording:** https://www.loom.com/share/984ed008aa3a4914bb448b32464aa0bc

## Tech stack

- Next.js (App Router) with TypeScript
- Tailwind CSS and shadcn/ui
- MongoDB with Mongoose
- JWT authentication in an HttpOnly cookie (`jose`), passwords hashed with bcrypt

## Setup (about 5 minutes)

Requirements: Node.js 20.9 or newer, and a MongoDB database.

1. Clone the repo and install dependencies:

```bash
   git clone https://github.com/bernard-ekoli/event_board.git
   cd event_board
   npm install
```

2. Create your environment file by copying the example:

```bash
   cp .env.example .env.local
```

   On Windows PowerShell use `copy .env.example .env.local`.

3. Fill in `.env.local`:

   | Variable | What it is |
   |---|---|
   | `MONGODB_URI` | MongoDB connection string. The link I sent in my email already contains the 15 sample events, or use your own database. |
   | `JWT_SECRET` | Any long random string, used to sign login tokens. |
   | `ADMIN_EMAIL` | Any email you choose. It becomes the admin login email (see Admin login below). |
   | `ADMIN_PASSWORD` | Any password you choose. It becomes the admin login password (see Admin login below). |

4. Start the app:

```bash
   npm run dev
```

   Open http://localhost:3000

5. (Optional) Sample data. Only needed if you use your own empty database. It adds 15 sample events, some inactive, some in the past, in different categories and cities:

```bash
   npm run seed
```

   Please do not run this on the shared database from my email.

## Admin login

There is one hard-coded admin. Its email and password are not stored in the database or in the code. They come from the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values in the environment file.

- **Running locally:** log in at http://localhost:3000/admin/login with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` you put in your own `.env.local`.
- **Live demo:** log in at https://event-board-9fv6.vercel.app/admin/login with the demo credentials from my email (demo credentials for review only).

The admin can add events and switch them Active or Inactive. There is no delete.

## Features

**Admin**
- Admin login, with admin pages and admin APIs protected on the server
- Add an event (title, category, city, date and time, price, description, image URL)
- Make an event Active or Inactive

**Visitors**
- Events page with only active, upcoming events, nearest first
- Combined filters (category, city, text search) with pagination
- Signup and login with email and password (JWT)
- Favourite categories and a "My Feed" page
- "Remind me" button with an immediate update that rolls back with a message if saving fails
- Event card designer: 3 themes, 5 stickers (max 3), live animation, saved per user per event

## API list

All responses are JSON. Errors use the shape `{ "message": "..." }`.

**Public**

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/events` | Active, upcoming events. Query: `category`, `city`, `q`, `page`, `limit` |
| GET | `/api/events/:id` | One event. When logged in, also returns `reminded` and the user's saved card design |
| GET | `/api/cities` | Cities for the filter dropdown |

**Account**

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Log in, sets the token cookie |
| POST | `/api/auth/logout` | Clear the token cookie |
| GET | `/api/me` | Current user (401 if not logged in) |
| PUT | `/api/me/favourites` | Save favourite categories |

**Logged-in user**

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/feed` | Upcoming events from the user's favourite categories |
| PUT | `/api/events/:id/reminder` | Set a reminder |
| DELETE | `/api/events/:id/reminder` | Remove a reminder |
| PUT | `/api/events/:id/card-design` | Save the user's card design for this event |

**Admin** (valid admin token required: 401 if not logged in, 403 if not an admin)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/events` | All events including inactive, paginated |
| POST | `/api/admin/events` | Add an event |
| PATCH | `/api/admin/events/:id` | Set `isActive` true or false |

## Answers to the three questions

### 1. Database structure and why

I used two collections. `users` stores the email, the hashed password and the favourite categories. `events` stores the event details, plus `remindedBy` (the users who set a reminder) and `cardDesigns` (one design per user). I kept these inside the event document to keep related data together, so reading and updating an event is simple, with no extra collections or lookups. The downside is that these arrays grow as more users interact with an event. At a larger scale I would move them into their own collections.

### 2. Filter query and index

Every public events query includes only active events scheduled from now onwards. Results are sorted by date, nearest first, and paginated. Category, city and text-search conditions are added only when provided. Category and city are exact matches, and the city input is trimmed first. Text search checks both title and description, ignores case, and escapes special characters so the input is treated as plain text. All conditions go into one filter, so the selected filters work together.

The index I would add is a compound index on `{ isActive: 1, category: 1, city: 1, dateTime: 1 }`. The exact-match fields come first, then the date used for the range check and the sort, so MongoDB can narrow the results and return them in date order. The regex text search does not benefit much from this index, so at a larger scale I would add a text index for search. I have not added this index in the code yet.

### 3. Passwords and admin protection

Passwords are hashed with bcrypt before they are saved, so the database never holds a plain text password. After a successful login, the server sets a signed JWT in an HttpOnly `token` cookie. The browser stores it and sends it with later requests, and JavaScript on the page cannot read it. The token expires after 24 hours. The login response returns the user's details (id, email, favourite categories) and never the password hash.

Admin credentials are hard-coded in environment variables, and admin login issues a JWT with `role: "admin"`. The admin pages are protected by `proxy.ts`, which runs on the server before an `/admin` page loads. It lets `/admin/login` through and redirects to login unless the cookie holds a valid JWT with the admin role. The admin APIs are protected separately: each one calls `requireAdmin` in `lib/auth.ts`, which returns 401 when there is no valid session and 403 when the user is logged in but not an admin.

## Where I used AI tools

- **V0** generated the frontend scaffolding (pages, components and styling) from prompts that included my API contract. I read through it and connected it to my backend.
- **GitHub Copilot** helped write parts of the API routes, in the style of the login and signup routes I wrote myself. I reviewed and tested every route.
- **Claude** helped me plan the work, understand the requirements and review my approach.

I can explain all of the submitted code.

## Notes and what is left

- The backend routes were committed in feature groups at the end of my working session, not one by one as I wrote them.
- Nothing from the brief is left unfinished.
