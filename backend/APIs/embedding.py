import ollama

_QUERY_PREFIX = "Represent this sentence for searching relevant passages: "


def embed(text, task="document"):
    prompt = _QUERY_PREFIX + text if task == "query" else text
    response = ollama.embeddings(model="mxbai-embed-large", prompt=prompt)
    return response["embedding"]
