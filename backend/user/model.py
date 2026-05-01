class follow():
    def __init__(self, id=None, name=None):
        self.id=id
        self.name=name

    def fromClassToMap(self):
        return{
            "id": self.id,
            "name": self.name
        }
    
    def fromMapToClass(self, hmap):
        self.id=hmap["id"]
        self.name=hmap["name"]
    

class user():
    def __init__(self, id=None, password=None, email=None, username=None, bio=None, isVerified=None, following=None):
        self.id = id
        self.password = password
        self.email = email
        self.username = username
        self.bio = bio
        self.isVerified = isVerified
        self.following = following

    def fromClassToMap(self):
        return{
            "following": [x.fromClassToMap() for x in self.following],
            "id": self.id,
            "password": self.password,
            "email": self.email,
            "username": self.username,
            "bio": self.bio,
            "isVerified": self.isVerified
        }
    
    def fromMapToClass(self, hmap){
        self.following = [x.fromMapToClass for x in hmap["following"]]
        
    }

