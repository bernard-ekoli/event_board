import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing from .env.local.");
}

function dateInDays(days, hour = 18) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

const now = new Date();
const mockEvents = [
  {
    id: "66f1a2b3c4d5e6f708090006",
    title: "Indie Music in the Garden",
    category: "Music",
    city: "Mumbai",
    daysFromNow: 5,
    price: 399,
    description:
      "Hear independent artists perform outdoors, with food stalls and space to relax with friends.",
    imageUrl:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=80",
    cardDesign: { theme: "sunset", stickers: ["music", "party"] },
  },
  {
    id: "66f1a2b3c4d5e6f708090007",
    title: "Paint and Sip Afternoon",
    category: "Workshop",
    city: "Bengaluru",
    daysFromNow: 8,
    price: 650,
    description:
      "Try a relaxed beginner painting session. Your canvas and art supplies are ready when you arrive.",
    imageUrl:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1600&q=80",
    cardDesign: { theme: "ocean", stickers: ["sparkles", "heart"] },
  },
  {
    id: "66f1a2b3c4d5e6f708090008",
    title: "Sunday Brunch Market",
    category: "Food",
    city: "Delhi",
    daysFromNow: 10,
    price: 250,
    description:
      "Browse local makers and enjoy breakfast plates, fresh coffee, and treats from neighbourhood kitchens.",
    imageUrl:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=80",
    cardDesign: { theme: "sunset", stickers: ["heart", "star"] },
  },
  {
    id: "66f1a2b3c4d5e6f708090009",
    title: "Sunrise Yoga by the Lake",
    category: "Sports",
    city: "Pune",
    daysFromNow: 13,
    price: 199,
    description:
      "Start your morning with an easy outdoor yoga class. Bring a mat and water bottle.",
    imageUrl:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1600&q=80",
    cardDesign: { theme: "ocean", stickers: ["sparkles"] },
  },
  {
    id: "66f1a2b3c4d5e6f708090010",
    title: "Little Explorers Nature Day",
    category: "Kids",
    city: "Chennai",
    daysFromNow: 16,
    price: 175,
    description:
      "A family-friendly outdoor day with nature trails, simple activities, and plenty to discover.",
    imageUrl:
      "https://images.unsplash.com/photo-1476231682828-37e571bc172f?auto=format&fit=crop&w=1600&q=80",
    cardDesign: { theme: "sunset", stickers: ["star", "heart"] },
  },
  {
    id: "66f1a2b3c4d5e6f708090011",
    title: "Acoustic Songs by Candlelight",
    category: "Music",
    city: "Hyderabad",
    daysFromNow: 19,
    price: 550,
    description:
      "Enjoy an intimate acoustic set from local musicians in a cosy candlelit venue.",
    imageUrl:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1600&q=80",
    cardDesign: { theme: "midnight", stickers: ["sparkles", "heart"] },
  },
  {
    id: "66f1a2b3c4d5e6f708090012",
    title: "Make Your Own Pasta",
    category: "Workshop",
    city: "Kochi",
    daysFromNow: 22,
    price: 900,
    description:
      "Learn to mix, knead, and shape fresh pasta in a friendly hands-on cooking class.",
    imageUrl:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1600&q=80",
    cardDesign: { theme: "sunset", stickers: ["fire", "heart"] },
  },
  {
    id: "66f1a2b3c4d5e6f708090013",
    title: "Open-Air Badminton Meetup",
    category: "Sports",
    city: "Jaipur",
    daysFromNow: 25,
    price: 0,
    description:
      "Meet other players for casual doubles games. Rackets and shuttlecocks are available to borrow.",
    imageUrl:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1600&q=80",
    cardDesign: { theme: "ocean", stickers: ["party", "star"] },
  },
  {
    id: "66f1a2b3c4d5e6f708090014",
    title: "Mini Makers Craft Club",
    category: "Kids",
    city: "Ahmedabad",
    daysFromNow: 28,
    price: 225,
    description:
      "Kids can make, colour, and take home their own creations in this cheerful craft session.",
    imageUrl:
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1600&q=80",
    cardDesign: { theme: "sunset", stickers: ["sparkles", "star", "heart"] },
  },
  {
    id: "66f1a2b3c4d5e6f708090015",
    title: "Night Food Truck Festival",
    category: "Food",
    city: "Kolkata",
    daysFromNow: 31,
    price: 100,
    description:
      "Spend the evening sampling street food favourites and new flavours from local food trucks.",
    imageUrl:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1600&q=80",
    cardDesign: { theme: "midnight", stickers: ["fire", "party"] },
  },
].map(({ id, daysFromNow, ...event }) => ({
  _id: new ObjectId(id),
  ...event,
  dateTime: dateInDays(daysFromNow),
  isActive: true,
  remindedBy: [],
  createdAt: now,
  updatedAt: now,
}));

const client = new MongoClient(uri);

try {
  await client.connect();
  const events = client.db().collection("events");
  const result = await events.bulkWrite(
    mockEvents.map((event) => ({
      updateOne: {
        filter: { _id: event._id },
        update: { $setOnInsert: event },
        upsert: true,
      },
    })),
  );

  console.log(`Inserted ${result.upsertedCount} new mock events.`);
  console.log(`Skipped ${result.matchedCount} events that were already seeded.`);
  console.log(`Total events in database: ${await events.countDocuments()}.`);
} finally {
  await client.close();
}
