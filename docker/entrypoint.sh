#!/bin/sh
set -e
echo "[entrypoint] Seeding database..."
node /app/seed.js
echo "[entrypoint] Starting Flask..."
exec python app.py
