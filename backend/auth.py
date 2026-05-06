from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import g, jsonify, request

import config


def encode_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=config.JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, config.JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(token, config.JWT_SECRET, algorithms=["HS256"])


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("jwt")
        if not token:
            return jsonify({"code": 401}), 401
        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"code": 401}), 401
        except jwt.InvalidTokenError:
            return jsonify({"code": 401}), 401

        from users.repository import find_by_id
        user = find_by_id(payload["user_id"])
        if not user:
            return jsonify({"code": 401}), 401
        g.user = user
        return f(*args, **kwargs)

    return decorated


def require_verified(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not g.user.verified:
            return jsonify({"code": 403}), 403
        return f(*args, **kwargs)

    return decorated
