from pathlib import Path

import yaml
from flask import Flask
from flask_cors import CORS
from flasgger import Swagger

from events.routes import events_bp
from users.routes import users_bp

SPEC_PATH = Path(__file__).resolve().parent.parent / "endpoints" / "endpoints.yaml"

app = Flask(__name__)
CORS(app)

with open(SPEC_PATH, "r", encoding="utf-8") as f:
    template = yaml.safe_load(f)

swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": "apispec",
            "route": "/apispec.json",
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/apidocs/",
    "openapi": "3.0.3",
}

Swagger(app, template=template, config=swagger_config)

app.register_blueprint(events_bp)
app.register_blueprint(users_bp)

if __name__ == "__main__":
    app.run(debug=True)
