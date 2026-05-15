import asyncio
import ollama

async def embed(prompt):
    return await ollama.embeddings(model="nomic-embed-text", prompt="hello world")