from typing import Optional

from bson import ObjectId

import db
from users.model import User


def find_by_id(user_id: str) -> Optional[User]:
    doc = db.users.find_one({"_id": ObjectId(user_id)})
    return User.from_doc(doc) if doc else None


def find_by_email(email: str) -> Optional[User]:
    doc = db.users.find_one({"email": email})
    return User.from_doc(doc) if doc else None


def insert(user: User) -> str:
    result = db.users.insert_one(user.to_doc())
    return str(result.inserted_id)


def update_fields(user_id: str, fields: dict):
    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": fields})


def add_bookmark(user_id: str, event_id: ObjectId):
    db.users.update_one({"_id": ObjectId(user_id)}, {"$addToSet": {"bookmarks": event_id}})


def remove_bookmark(user_id: str, event_id: ObjectId):
    db.users.update_one({"_id": ObjectId(user_id)}, {"$pull": {"bookmarks": event_id}})
