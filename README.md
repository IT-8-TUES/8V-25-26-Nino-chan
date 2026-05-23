# TUES Event Calendar

## About

This project is a web application built for the students and teachers of TUES. Its purpose is to replace the old habit of sending event announcements by email — emails that often get ignored or lost. Instead, everyone has a single place to publish and discover school events, particularly those related to technology and engineering.

## Summary

The platform allows any registered user to browse and search for upcoming school events. To publish events, a user must first be verified by the admins. Verification is requested through the app, and once approved, the user can post events that others can find and save.

Users can search for events by title or publisher name. Since the subject of an event is typically reflected in its title, searching by keyword effectively lets you filter by topic as well. Date-based filtering is available directly from the homepage calendar.

## How It Works

When you first register, you can browse, search, and bookmark events, but you cannot publish them yet. To gain publishing rights, you submit a verification request through the Verify page. The admins receive a notification and approve your account manually. After that, you can create and publish events.

When you find an event you want to attend, you can bookmark it from its detail page. Bookmarked events appear in your personal Archive, but only if they haven't happened yet — once an event's date passes, it is automatically removed from your Archive.

---

## Pages

### Home

The main landing page. Displays a calendar for the selected month. Clicking on any date shows a brief summary of the events scheduled for that day. This is the primary way to browse events by date. The page also provides navigation links to the Search, Archive, and Profile pages.

### Login

A simple login form. Enter your credentials and you will be taken to the homepage.

### Register

Create a new account. After registering, you can browse and interact with the platform, but you will not be able to publish events until your account is verified.

### Verify

Submit a request to become a verified publisher. The admins receive an email notification and will approve your account. Once approved, you can publish events on the platform.

### Search

Search for events by title or publisher name. The search is flexible — since most events include their topic in the title, you can effectively search by subject as well. Results are displayed as a paginated list with navigation arrows to move between pages. Click any result to view the full event details.

### Long Description

The full detail page for a single event. Displays the event's title, date, publisher, and a detailed description of what the event is about. From this page, you can bookmark the event to save it to your personal Archive.

### Archive

Your personal list of bookmarked events. Only shows events that are still upcoming — events whose dates have already passed are automatically hidden. Think of it as your personal "events I want to attend" list.

### Profile

Displays a user's public information: their username, email address, and bio. You can view any user's profile, but you can only edit your own.

### Recommendations

A personalised discovery page powered by semantic ("vibe") search. Instead of matching keywords, you describe the kind of event you're looking for in plain language — for example *"a hands-on workshop about robotics"* — and the platform returns the five upcoming events whose descriptions are most semantically similar to your prompt.

If you leave the prompt empty, the page falls back to your saved **preference** string — a short free-text description of your interests that you can update from your profile. This means the page can act as a passive feed of events tailored to you, even without typing a query each time.

Under the hood every event is embedded into a 1024-dimensional vector at creation time using the `mxbai-embed-large` model served locally by Ollama. Your query is embedded with the same model and compared against the event vectors using MongoDB Atlas `$vectorSearch` over a cosine-similarity index. Only upcoming events are eligible — past events are filtered out.

---

## Technologies Used

### Backend
- **Python 3** with **Flask** and **Flask-CORS** for the HTTP API.
- **Granian** as the production ASGI/WSGI server (replacing the earlier Waitress setup).
- **Flasgger** + **PyYAML** to serve the OpenAPI 3.0.3 spec (`endpoints/endpoints.yaml`) as an interactive Swagger UI at `/apidocs/`.
- **PyJWT** for stateless JWT-based authentication and **bcrypt** for password hashing.
- **python-dotenv** for environment configuration.

### Database
- **MongoDB** as the primary store, accessed via **pymongo**.
- **MongoDB Atlas Vector Search** with a cosine-similarity index (`cosine_index`) on the `events.embedding` field, powering the Recommendations page.

### AI / Embeddings
- **Ollama** running the **`mxbai-embed-large`** model locally to generate 1024-dimensional embeddings for both events and user queries.
- **httpx** for HTTP calls to the embedding service.

### Frontend
- **Vanilla HTML, CSS, and JavaScript** — no frameworks, no build step, no templating engine. All dynamic content is constructed with the DOM API.
- JWTs are stored in `localStorage` and attached to API requests by a small shared `api.js` helper.

### Tooling
- **Node.js** with `mongodb`, `bcryptjs`, and `dotenv` for the database seed script (`seed.js`).
- **PowerShell** (`install.ps1`) and **Bash** (`install.sh`) installation scripts that create a Python virtual environment and install dependencies.

---

## Repository Structure

```
root/
├── .gitignore
├── README.md
├── dependencies list
├── dependency installation script
├── backend/
├── NIKOLA/
├── MARTI/
├── PHILIP/
└── KRISTIAN/
```
