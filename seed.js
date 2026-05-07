// Seed script — populates the database with starter users and events.
// Run: node seed.js
// Requires: npm install mongodb bcryptjs dotenv

const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const URI     = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGO_DB  || "tues_calendar";

// All seed accounts use this password.
const SEED_PASSWORD = "password123";

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
  await db.collection("events").insertMany([
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
  ]);
  console.log("Inserted 6 events (4 upcoming, 2 past).");

  // --- Users ---
  await db.collection("users").insertMany([
    {
      _id:           userId.ivan,
      email:         "ivan.petrov@tues.bg",
      username:      "ivanpetrov",
      password_hash: hash,
      bio:           "Teacher at TUES. Organises programming workshops and loves Python.",
      verified:      true,
      bookmarks:     [],
    },
    {
      _id:           userId.maria,
      email:         "maria.georgieva@tues.bg",
      username:      "mariag",
      password_hash: hash,
      bio:           "Robotics and embedded systems enthusiast. Club president.",
      verified:      true,
      bookmarks:     [eventId.python],
    },
    {
      _id:           userId.stefan,
      email:         "stefan.dimitrov@tues.bg",
      username:      "stefand",
      password_hash: hash,
      bio:           "10th grade student interested in web development.",
      verified:      false,
      bookmarks:     [eventId.python, eventId.robotics, eventId.cybersec],
    },
    {
      _id:           userId.elena,
      email:         "elena.todorova@tues.bg",
      username:      "elenat",
      password_hash: hash,
      bio:           "11th grade. Into AI and competitive programming.",
      verified:      false,
      bookmarks:     [eventId.react, eventId.cybersec],
    },
  ]);
  console.log("Inserted 4 users (2 verified, 2 unverified). Password for all: " + SEED_PASSWORD);

  await client.close();
  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
