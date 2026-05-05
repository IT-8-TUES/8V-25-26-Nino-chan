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
