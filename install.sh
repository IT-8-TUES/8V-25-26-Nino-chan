#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

# --- Backend: Python virtual environment + pip ---
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv .venv
fi

# Activate venv (Windows Git Bash uses Scripts/, Linux/macOS uses bin/)
if [ -f ".venv/Scripts/activate" ]; then
    source .venv/Scripts/activate
else
    source .venv/bin/activate
fi

echo "Installing backend dependencies..."
pip install --upgrade pip
pip install -r backend-requirements.txt

# --- Frontend: npm ---
echo "Installing frontend dependencies..."
packages=()
while IFS= read -r line || [ -n "$line" ]; do
    line="${line%%#*}"
    line="$(echo "$line" | xargs)"
    [ -z "$line" ] && continue
    packages+=("$line")
done < frontend-requirements.txt

if [ ${#packages[@]} -gt 0 ]; then
    npm install "${packages[@]}"
else
    echo "No frontend packages listed."
fi

echo "Done."
