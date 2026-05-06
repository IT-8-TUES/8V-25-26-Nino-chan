from pymongo import MongoClient
import config

_client = MongoClient(config.MONGO_URI)
_db = _client[config.MONGO_DB]

users = _db["users"]
events = _db["events"]
