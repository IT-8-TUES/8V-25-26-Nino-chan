import io
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from flask import Flask, g, jsonify, request, send_file
from flask_cors import CORS
from PIL import Image

from auth import require_auth

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads" / "profile-pics"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_BYTES = 10 * 1024 * 1024
FORMAT_EXT = {"JPEG": "jpg", "PNG": "png", "GIF": "gif"}
FORMAT_MIME = {"jpg": "image/jpeg", "png": "image/png", "gif": "image/gif"}

app = Flask(__name__)
CORS(app)


@app.post("/pic")
@require_auth
def upload_pic():
    file = request.files.get("file")
    if not file:
        return jsonify({"code": 400}), 400

    data = file.read()
    if len(data) > MAX_BYTES:
        return jsonify({"code": 413}), 413

    try:
        img = Image.open(io.BytesIO(data))
        fmt = img.format
    except Exception:
        return jsonify({"code": 400}), 400

    if fmt not in FORMAT_EXT:
        return jsonify({"code": 415}), 415

    ext = FORMAT_EXT[fmt]
    user_id = str(g.user._id)

    for old in UPLOAD_DIR.glob(f"{user_id}.*"):
        old.unlink()

    (UPLOAD_DIR / f"{user_id}.{ext}").write_bytes(data)
    return jsonify({"code": 200})


@app.get("/pic/<userid>")
@require_auth
def get_pic(userid):
    matches = list(UPLOAD_DIR.glob(f"{userid}.*"))
    if not matches:
        return jsonify({"code": 404}), 404

    path = matches[0]
    mime = FORMAT_MIME.get(path.suffix.lstrip(".").lower(), "application/octet-stream")
    response = send_file(path, mimetype=mime)
    response.headers["Cache-Control"] = "no-cache"
    return response


if __name__ == "__main__":
    from granian import Granian
    Granian("pics_app.app:app", address="0.0.0.0", port=5001, interface="wsgi", blocking_threads=1).serve()
