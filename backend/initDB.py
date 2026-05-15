import db

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