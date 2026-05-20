import db


def index():
    try:
        db.events.create_search_index({
            "name": "cosine_index",
            "type": "vectorSearch",
            "definition": {
                "fields": [
                    {
                        "type": "vector",
                        "path": "embedding",
                        "numDimensions": 768,
                        "similarity": "cosine"
                    },
                    {
                        "type": "filter",
                        "path": "date"
                    },
                    {
                        "type": "filter",
                        "path": "user_id"
                    }
                ]
            }
        })
    except Exception as e:
        msg = str(e)
        if "already exists" in msg or "IndexAlreadyExists" in msg:
            pass  # index was created on a previous run
        else:
            print(f"[initDB] Could not create vector index: {e}")
