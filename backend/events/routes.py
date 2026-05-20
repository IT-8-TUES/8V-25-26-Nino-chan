import auth
from flask import Blueprint, g, jsonify, request
from events import service as event_service

events_bp = Blueprint("events", __name__)


@events_bp.route("/event/<id>", methods=["GET"])
@auth.require_auth
def get_event(id):
    mode, data = event_service.get_by_date_or_id(id)
    if mode == "not_found":
        return jsonify({"code": 404}), 404
    return jsonify(data)


@events_bp.route("/event", methods=["GET"])
@auth.require_auth
def search_events():
    title = request.args.get("title", "")
    user = request.args.get("user", "")
    page_num = int(request.args.get("page_num", 0))
    return jsonify(event_service.search(title, user, page_num))


@events_bp.route("/event", methods=["POST"])
@auth.require_auth
@auth.require_verified
def create_event():
    data = request.get_json()
    event_service.create(g.user, data["title"], data["description"], data["date"])
    return jsonify({"code": 200})


@events_bp.route("/vibeSearch", methods=["GET"])
@auth.require_auth
def recomend():
    prompt = request.args.get("prompt", "")
    print("maybe it is an error here")
    return jsonify(event_service.vibeSearch(str(g.user._id), prompt))
