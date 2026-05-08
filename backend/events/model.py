class Event:
    def __init__(self, title, description, date, creator_id, creator_username, _id=None):
        self._id = _id
        self.title = title
        self.description = description
        self.date = date
        self.creator_id = creator_id
        self.creator_username = creator_username

    @staticmethod
    def from_doc(doc):
        return Event(
            _id=doc["_id"],
            title=doc["title"],
            description=doc["description"],
            date=doc["date"],
            creator_id=doc["creator_id"],
            creator_username=doc["creator_username"],
        )
