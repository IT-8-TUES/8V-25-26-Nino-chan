from bson import ObjectId


class User:
    def __init__(self, email, username, password_hash, embedding=None, pref = "", bio="", verified=False, bookmarks=None, _id=None):
        self._id = _id
        self.email = email
        self.username = username
        self.password_hash = password_hash
        self.bio = bio
        self.verified = verified
        self.preference = pref
        self.embedding = embedding if embedding is not None else [0 for i in range(768)]
        self.bookmarks = bookmarks if bookmarks is not None else []

    @staticmethod
    def from_doc(doc):
        return User(
            _id=doc["_id"],
            email=doc["email"],
            username=doc["username"],
            password_hash=doc["password_hash"],
            embedding=doc.get("embedding", [0 for i in range(768)]),
            pref=doc.get("pref", ""),
            bio=doc.get("bio", ""),
            verified=doc.get("verified", False),
            bookmarks=doc.get("bookmarks", []),
        )

    def to_doc(self):
        return {
            "email": self.email,
            "username": self.username,
            "password_hash": self.password_hash,
            "pref": self.preference,
            "embedding": self.embedding,
            "bio": self.bio,
            "verified": self.verified,
            "bookmarks": self.bookmarks,
        }
