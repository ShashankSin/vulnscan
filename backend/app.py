from flask import Flask
from flask_cors import CORS

from routes.pdf_route import pdf_bp
from routes.scan_stream import scan_bp
from routes.auth import auth
from routes.user_dashboard import dashboard_bp

from db import init_db

app = Flask(__name__)

CORS(
    app,
    resources={r"/api/*": {
        "origins": "http://localhost:5173"
    }},
    supports_credentials=True,
    allow_headers=[
        "Content-Type",
        "Authorization",
        "X-Requested-With"
    ],
    expose_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)
init_db()

app.register_blueprint(auth, url_prefix="/api/auth")
app.register_blueprint(scan_bp, url_prefix="/api")
app.register_blueprint(dashboard_bp, url_prefix="/api")
app.register_blueprint(pdf_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True, port=5000)