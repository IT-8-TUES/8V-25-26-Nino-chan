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


def find_upcoming_by_ids(ids: list, from_date: str) -> list:
    return [Event.from_doc(d) for d in db.events.find({"_id": {"$in": ids}, "date": {"$gte": from_date}})]


def search(title: str = "", user: str = "", page_num: int = 0) -> list:
    today = date_type.today().isoformat()
    query = {"date": {"$gte":today}}
    if title:
        query["title"] = {"$regex": title, "$options": "i"}
    if user:
        query["creator_username"] = {"$regex": user, "$options": "i"}
    return [Event.from_doc(d) for d in db.events.find(query).sort("date", 1).skip(page_num * _PAGE_SIZE).limit(_PAGE_SIZE)]


def insert(event: Event) -> str:
    result = db.events.insert_one({
        "title": event.title,
        "description": event.description,
        "date": event.date,
        "creator_id": event.creator_id,
        "creator_username": event.creator_username,
    })
    return str(result.inserted_id)
