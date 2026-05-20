import ollama

def embed(prompt):
    response = ollama.embeddings(model="nomic-embed-text", prompt=prompt)
    return response["embedding"]