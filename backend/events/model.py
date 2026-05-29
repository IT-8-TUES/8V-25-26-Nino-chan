class Event:
    def __init__(self, title, description, date, creator_id, creator_username, embedding=[0 for i in range(1024)],_id=None):
        self._id = _id
        self.title = title
        self.description = description
        self.date = date
        self.creator_id = creator_id
        self.creator_username = creator_username
        self.embedding = embedding

    @staticmethod
    def from_doc(doc):
        return Event(
            _id=doc["_id"],
            title=doc["title"],
            description=doc["description"],
            date=doc["date"],
            creator_id=doc["creator_id"],
            creator_username=doc["creator_username"],
            embedding=doc["embedding"]
        )
