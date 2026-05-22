import re

from datetime import date as date_type

from events import repository as event_repo
from events.model import Event
from users import repository as user_repo
from users.model import User

from APIs.embedding import embed

_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def get_by_date_or_id(id: str):
    if _DATE_RE.match(id):
        evs = event_repo.find_by_date(id)
        return "list", [{"title": e.title, "creator": e.creator_username, "id": str(e._id)} for e in evs]

    ev = event_repo.find_by_id(id)
    if ev is None:
        return "not_found", None
    return "detail", {
        "title": ev.title,
        "description": ev.description,
        "date": ev.date,
        "creator": ev.creator_username,
        "creatorid": str(ev.creator_id),
    }


def search(title: str, user: str, page_num: int) -> list:
    evs = event_repo.search(title, user, page_num)
    return [{
        "date": e.date,
        "title": e.title,
        "eventid": str(e._id),
        "creatorid": str(e.creator_id),
        "creator": e.creator_username,
    } for e in evs]


def vibeSearch(user_id, prompt):
    if prompt == "" or prompt==None:
        user = user_repo.find_by_id(user_id)
        vector = embed(user.preference, task="query")
    else:
        vector = embed(prompt, task="query")

    today = date_type.today().isoformat()

    return [{
        "title": doc["title"],
        "creator": doc["creator_username"],
        "date": doc["date"],
        "id": str(doc["_id"]),
    } for doc in event_repo.vectorSearch(vector, today)]



def create(user: User, title: str, description: str, event_date: str):
    event_repo.insert(Event(
        title=title,
        description=description,
        date=event_date,
        creator_id=user._id,
        creator_username=user.username,
        embedding=embed(description, task="document")

    ))
