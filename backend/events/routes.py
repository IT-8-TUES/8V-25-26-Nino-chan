import auth
from flask import Blueprint, g, jsonify, request
from events import service as event_service

events_bp = Blueprint("events", __name__)


@events_bp.route("/event/mine", methods=["GET"])
@auth.require_auth
def get_my_events():
    return jsonify(event_service.get_my_events(g.user))


@events_bp.route("/event/<id>", methods=["GET"])
@auth.require_auth
def get_event(id):
    mode, data = event_service.get_by_date_or_id(id)
    if mode == "not_found":
        return jsonify({"code": 404}), 404
    return jsonify(data)


@events_bp.route("/event/<id>", methods=["PUT"])
@auth.require_auth
@auth.require_verified
def update_event(id):
    data = request.get_json()
    result = event_service.update_event(g.user, id, data["title"], data["description"], data["date"])
    if result == "not_found":
        return jsonify({"code": 404}), 404
    if result == "forbidden":
        return jsonify({"code": 403}), 403
    return jsonify({"code": 200})


@events_bp.route("/event/<id>", methods=["DELETE"])
@auth.require_auth
@auth.require_verified
def delete_event(id):
    result = event_service.delete_event(g.user, id)
    if result == "not_found":
        return jsonify({"code": 404}), 404
    if result == "forbidden":
        return jsonify({"code": 403}), 403
    return jsonify({"code": 200})


@events_bp.route("/event/month/<year>/<month>", methods=["GET"])
@auth.require_auth
def get_month_dates(year, month):
    return jsonify(event_service.get_dates_in_month(year, month))


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
