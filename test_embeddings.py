import json
import math
import urllib.request

OLLAMA = "http://localhost:11434"
MODEL = "nomic-embed-text"


def embed(text, task):
    prefix = "search_query: " if task == "query" else "search_document: "
    req = urllib.request.Request(
        f"{OLLAMA}/api/embeddings",
        data=json.dumps({"model": MODEL, "prompt": prefix + text}).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())["embedding"]


def cos(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(x * x for x in b))
    return dot / (na * nb)


docs = {
    "classical_ml": "A lecture on classical machine learning algorithms",
    "neural_nets": "A lecture on neural networks",
    "python": "A hands-on introduction to Python programming. We will cover variables, loops, functions and basic data structures.",
    "robotics": "Monthly gathering of the TUES Robotics Club. This session focuses on line-following algorithms and sensor calibration for the upcoming competition.",
    "react": "Learn how to build modern single-page applications using React. Topics include components, state management, hooks and connecting to a REST API.",
    "cybersec": "An introduction to common attack vectors and how to defend against them. The second half of the session will cover strategies for beginner CTF competitions.",
    "ai_general": "A guest lecture covering the fundamentals of machine learning, neural networks and practical applications in industry.",
    "arduino": "Students present their Arduino-based projects from the semester. Visitors are welcome.",
}

doc_vecs = {k: embed(v, "document") for k, v in docs.items()}

for q in ["Deep learning", "Transformer architecture", "Python beginners"]:
    qv = embed(q, "document")
    ranked = sorted(docs, key=lambda k: -cos(qv, doc_vecs[k]))
    print(f"\n=== Query: {q} ===")
    for k in ranked:
        print(f"  {cos(qv, doc_vecs[k]):.4f}  {k}")

print("\n--- Without prefixes (the bug) ---")
for q in ["Deep learning", "Transformer architecture"]:
    qv_raw = embed_raw = json.loads(urllib.request.urlopen(urllib.request.Request(
        f"{OLLAMA}/api/embeddings",
        data=json.dumps({"model": MODEL, "prompt": q}).encode(),
        headers={"Content-Type": "application/json"},
    )).read())["embedding"]
    raw_docs = {k: json.loads(urllib.request.urlopen(urllib.request.Request(
        f"{OLLAMA}/api/embeddings",
        data=json.dumps({"model": MODEL, "prompt": v}).encode(),
        headers={"Content-Type": "application/json"},
    )).read())["embedding"] for k, v in docs.items()}
    ranked = sorted(docs, key=lambda k: -cos(qv_raw, raw_docs[k]))
    print(f"\n=== Query (no prefix): {q} ===")
    for k in ranked[:4]:
        print(f"  {cos(qv_raw, raw_docs[k]):.4f}  {k}")
