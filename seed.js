// Seed script — populates the database with starter users and events.
// Run: node seed.js
// Requires: npm install mongodb bcryptjs dotenv

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const URI         = process.env.MONGO_URI;
const DB_NAME     = process.env.MONGO_DB  || "TuesCalendar";
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";

// All seed accounts use this password.
const SEED_PASSWORD = "password123";

async function embed(prompt) {
  const res = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "nomic-embed-text", prompt }),
  });
  if (!res.ok) {
    throw new Error(`Ollama embed failed (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return data.embedding;
}

async function seed() {
  const client = new MongoClient(URI);
  await client.connect();
  const db = client.db(DB_NAME);

  await db.collection("users").deleteMany({});
  await db.collection("events").deleteMany({});
  console.log("Cleared existing users and events.");

  const hash = await bcrypt.hash(SEED_PASSWORD, 10);

  // --- User IDs ---
  const userId = {
    ivan:   new ObjectId(),
    maria:  new ObjectId(),
    stefan: new ObjectId(),
    elena:  new ObjectId(),
  };

  // --- Event IDs ---
  const eventId = {
    python:    new ObjectId(),
    robotics:  new ObjectId(),
    react:     new ObjectId(),
    ai:        new ObjectId(),
    cybersec:  new ObjectId(),
    arduino:   new ObjectId(),
  };

  // --- Events ---
  // Dates relative to seed date (2026-05-07): past = before, future = after.
  const events = [
    {
      _id:              eventId.python,
      title:            "Python Workshop for Beginners",
      description:      "A hands-on introduction to Python programming. We will cover variables, loops, functions and basic data structures. Bring your laptop. Room 214, 10:00–13:00.",
      date:             "2026-06-10",
      creator_id:       userId.ivan,
      creator_username: "ivanpetrov",
    },
    {
      _id:              eventId.robotics,
      title:            "Robotics Club Monthly Meetup",
      description:      "Monthly gathering of the TUES Robotics Club. This session focuses on line-following algorithms and sensor calibration for the upcoming competition.",
      date:             "2026-06-25",
      creator_id:       userId.maria,
      creator_username: "mariag",
    },
    {
      _id:              eventId.react,
      title:            "Web Development with React",
      description:      "Learn how to build modern single-page applications using React. Topics include components, state management, hooks and connecting to a REST API. Room 310.",
      date:             "2026-07-05",
      creator_id:       userId.ivan,
      creator_username: "ivanpetrov",
    },
    {
      _id:              eventId.cybersec,
      title:            "Cybersecurity Basics and CTF Tips",
      description:      "An introduction to common attack vectors and how to defend against them. The second half of the session will cover strategies for beginner CTF competitions.",
      date:             "2026-07-20",
      creator_id:       userId.maria,
      creator_username: "mariag",
    },
    {
      _id:              eventId.ai,
      title:            "AI and Machine Learning Talk",
      description:      "A guest lecture covering the fundamentals of machine learning, neural networks and practical applications in industry. Q&A session included.",
      date:             "2026-04-20",
      creator_id:       userId.ivan,
      creator_username: "ivanpetrov",
    },
    {
      _id:              eventId.arduino,
      title:            "Arduino Projects Showcase",
      description:      "Students present their Arduino-based projects from the semester. Visitors are welcome. Refreshments provided. Aula Magna, 14:00–17:00.",
      date:             "2026-03-15",
      creator_id:       userId.maria,
      creator_username: "mariag",
    },
  ];

  console.log(`Embedding ${events.length} event descriptions via ${OLLAMA_HOST}...`);
  const eventDocs = await Promise.all(events.map(async (e) => ({
    ...e,
    embedding: await embed(e.description),
  })));
  await db.collection("events").insertMany(eventDocs);
  console.log("Inserted 6 events (4 upcoming, 2 past).");

  // --- Users ---
  const users = [
    {
      _id:           userId.ivan,
      email:         "ivan.petrov@tues.bg",
      username:      "ivanpetrov",
      password_hash: hash,
      bio:           "Teacher at TUES. Organises programming workshops and loves Python.",
      pref:          "Python programming, beginner-friendly coding workshops, software development tutorials.",
      verified:      true,
      bookmarks:     [],
    },
    {
      _id:           userId.maria,
      email:         "maria.georgieva@tues.bg",
      username:      "mariag",
      password_hash: hash,
      bio:           "Robotics and embedded systems enthusiast. Club president.",
      pref:          "Robotics, embedded systems, hardware projects, sensors, microcontrollers, Arduino.",
      verified:      true,
      bookmarks:     [eventId.python],
    },
    {
      _id:           userId.stefan,
      email:         "stefan.dimitrov@tues.bg",
      username:      "stefand",
      password_hash: hash,
      bio:           "10th grade student interested in web development.",
      pref:          "Web development, frontend frameworks, React, JavaScript, building single-page applications.",
      verified:      false,
      bookmarks:     [eventId.python, eventId.robotics, eventId.cybersec],
    },
    {
      _id:           userId.elena,
      email:         "elena.todorova@tues.bg",
      username:      "elenat",
      password_hash: hash,
      bio:           "11th grade. Into AI and competitive programming.",
      pref:          "Artificial intelligence, machine learning, neural networks, competitive programming, algorithms.",
      verified:      false,
      bookmarks:     [eventId.react, eventId.cybersec],
    },
  ];

  console.log(`Embedding ${users.length} user preferences...`);
  const userDocs = await Promise.all(users.map(async (u) => ({
    ...u,
    embedding: await embed(u.pref),
  })));
  await db.collection("users").insertMany(userDocs);
  console.log("Inserted 4 users (2 verified, 2 unverified). Password for all: " + SEED_PASSWORD);

  await client.close();
  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
