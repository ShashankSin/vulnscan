from urllib import request

from flask import jsonify
import jwt

from backend.models.user_model import User
from backend.utils.auth_utils import SECRET


# role check middleware for the routes
def require_role(required_role):

    def wrapper(func):

        def decorated(*args, **kwargs):

            auth_header = request.headers.get("Authorization")
            token = auth_header.split(" ")[1]

            payload = jwt.decode(token, SECRET, algorithms=["HS256"])

            user = User.objects(id=payload["user_id"]).first()

            if user.role != required_role:
                return jsonify({"error": "Unauthorized"}), 403

            return func(*args, **kwargs)

        return decorated

    return wrapper