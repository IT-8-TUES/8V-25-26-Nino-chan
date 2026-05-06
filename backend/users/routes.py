import auth
from flask import Blueprint, g, jsonify, request
from users import service as user_service

users_bp = Blueprint("users", __name__)


@users_bp.route("/user/login", methods=["POST"])
def login():
    data = request.get_json()
    result = user_service.login(data["email"], data["password"])
    if result is None:
        return jsonify({"code": 401}), 401
    return jsonify(result)


@users_bp.route("/user/register", methods=["POST"])
def register():
    data = request.get_json()
    if not user_service.register(data["email"], data["password"], data["username"]):
        return jsonify({"code": 409}), 409
    return jsonify({"code": 200})


@users_bp.route("/user/verify", methods=["POST"])
@auth.require_auth
def verify():
    data = request.get_json()
    if not user_service.request_verification(g.user, data["password"]):
        return jsonify({"code": 401}), 401
    return jsonify({"code": 200})


@users_bp.route("/user", methods=["PATCH"])
@auth.require_auth
def update_profile():
    data = request.get_json()
    user_service.update_profile(g.user, data)
    return jsonify({"code": 200})


@users_bp.route("/user/<userid>", methods=["GET"])
@auth.require_auth
def get_user(userid):
    mode = request.args.get("mode", "profile")
    result = user_service.get_archive(userid) if mode == "archive" else user_service.get_profile(userid)
    if result is None:
        return jsonify({"code": 404}), 404
    return jsonify(result)


@users_bp.route("/user/<userid>", methods=["POST"])
@auth.require_auth
def mark_event(userid):
    data = request.get_json()
    try:
        user_service.toggle_bookmark(g.user, data["eventid"], data["participating"])
    except Exception:
        return jsonify({"code": 400}), 400
    return jsonify({"code": 200})
