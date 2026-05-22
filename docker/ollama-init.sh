#!/bin/sh
# Start ollama in the background, wait for it to be ready, then pull the model.
ollama serve &
SERVER_PID=$!

until ollama list > /dev/null 2>&1; do
  sleep 2
done

ollama pull mxbai-embed-large

wait $SERVER_PID
