from datetime import date as date_type

import bcrypt
from bson import ObjectId

import auth
from events import repository as event_repo
from mail import send_verify_request
from users import repository as user_repo
from users.model import User


def login(email: str, password: str):
    user = user_repo.find_by_email(email)
    if not user or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return None
    return {"code": 200, "jwt": auth.encode_token(str(user._id))}


def register(email: str, password: str, username: str) -> bool:
    if user_repo.find_by_email(email):
        return False
    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user_repo.insert(User(email=email, username=username, password_hash=pw_hash))
    return True


def request_verification(user: User, password: str) -> bool:
    if not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return False
    try:
        send_verify_request(user.username, user.email, str(user._id))
    except Exception:
        pass
    return True


def update_profile(user: User, fields: dict):
    allowed = {k: fields[k] for k in ("email", "username", "bio", "preference") if k in fields}
    if allowed:
        user_repo.update_fields(str(user._id), allowed)


def get_profile(user_id: str):
    user = user_repo.find_by_id(user_id)
    if not user:
        return None
    return {"email": user.email, "username": user.username, "bio": user.bio}


def get_archive(user_id: str):
    user = user_repo.find_by_id(user_id)
    if not user:
        return None
    today = date_type.today().isoformat()
    bookmark_ids = [b if isinstance(b, ObjectId) else ObjectId(b) for b in user.bookmarks]
    evs = event_repo.find_upcoming_by_ids(bookmark_ids, today)
    return [{"title": e.title, "creator": e.creator_username, "id": str(e._id)} for e in evs]


def toggle_bookmark(user: User, event_id: str, participating: bool):
    oid = ObjectId(event_id)
    if participating:
        user_repo.add_bookmark(str(user._id), oid)
    else:
        user_repo.remove_bookmark(str(user._id), oid)
