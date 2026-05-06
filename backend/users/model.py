from bson import ObjectId


class User:
    def __init__(self, email, username, password_hash, bio="", verified=False, bookmarks=None, _id=None):
        self._id = _id
        self.email = email
        self.username = username
        self.password_hash = password_hash
        self.bio = bio
        self.verified = verified
        self.bookmarks = bookmarks if bookmarks is not None else []

    @staticmethod
    def from_doc(doc):
        return User(
            _id=doc["_id"],
            email=doc["email"],
            username=doc["username"],
            password_hash=doc["password_hash"],
            bio=doc.get("bio", ""),
            verified=doc.get("verified", False),
            bookmarks=doc.get("bookmarks", []),
        )

    def to_doc(self):
        return {
            "email": self.email,
            "username": self.username,
            "password_hash": self.password_hash,
            "bio": self.bio,
            "verified": self.verified,
            "bookmarks": self.bookmarks,
        }
