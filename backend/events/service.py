import re

from events import repository as event_repo
from events.model import Event
from users.model import User

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


def create(user: User, title: str, description: str, event_date: str):
    event_repo.insert(Event(
        title=title,
        description=description,
        date=event_date,
        creator_id=user._id,
        creator_username=user.username,
    ))
