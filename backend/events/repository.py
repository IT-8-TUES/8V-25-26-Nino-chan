from typing import Optional

from bson import ObjectId

import db
from events.model import Event

from datetime import date as date_type

_PAGE_SIZE = 10




def find_by_id(event_id: str) -> Optional[Event]:
    try:
        doc = db.events.find_one({"_id": ObjectId(event_id)})
    except Exception:
        return None
    return Event.from_doc(doc) if doc else None


def find_by_date(date: str) -> list:
    return [Event.from_doc(d) for d in db.events.find({"date": date})]


def find_dates_in_month(year: str, month: str) -> list:
    return db.events.distinct("date", {"date": {"$regex": f"^{year}-{month}-"}})


def find_upcoming_by_ids(ids: list, from_date: str) -> list:
    return [Event.from_doc(d) for d in db.events.find({"_id": {"$in": ids}, "date": {"$gte": from_date}}).sort("date", 1)]


def search(title: str = "", user: str = "", page_num: int = 0) -> list:
    today = date_type.today().isoformat()

    # No query at all: browse all upcoming events, date-ascending.
    if not title and not user:
        cursor = db.events.find({"date": {"$gte": today}}).sort("date", 1).skip(page_num * _PAGE_SIZE).limit(_PAGE_SIZE)
        return [Event.from_doc(d) for d in cursor]

    # Full-text Atlas Search on description, ordered by relevance.
    compound = {}
    if title:
        compound["must"] = [{"text": {"query": title, "path": "description"}}]
    if user:
        compound["filter"] = [{"text": {"query": user, "path": "creator_username"}}]

    cursor = db.events.aggregate([
        {"$search": {"index": "event_search", "compound": compound}},
        {"$match": {"date": {"$gte": today}}},
        {"$skip": page_num * _PAGE_SIZE},
        {"$limit": _PAGE_SIZE},
    ])
    return [Event.from_doc(d) for d in cursor]

def vectorSearch(query_vector, today):
    top_k = 5
    print("maybe it is an error here")
    return db.events.aggregate([
        {
            "$vectorSearch": {
                "index": "cosine_index",
                "path": "embedding",
                "queryVector": query_vector,
                "numCandidates": top_k * 10,  # how many ANN candidates to scan
                "limit": top_k,                 # how many to return
                "filter": {"date": {"$gte": today}}
            }
        },
        {
            "$project": {
                "title": 1,
                #"score": {"$meta": "vectorSearchScore"},
                "_id": 1,
                "creator_username": 1,
                "date": 1
            }
        }
    ])


def insert(event: Event) -> str:
    result = db.events.insert_one({
        "title": event.title,
        "description": event.description,
        "date": event.date,
        "creator_id": event.creator_id,
        "creator_username": event.creator_username,
        "embedding": event.embedding,
    })
    return str(result.inserted_id)
