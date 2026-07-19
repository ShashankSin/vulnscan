from flask import Blueprint, request, jsonify
from models.user_model import User
from utils.auth_utils import hash_password, verify_password, create_token

auth = Blueprint("auth", __name__)


@auth.route("/register", methods=["POST"])
def register():

    data = request.json
    fullName = data.get("fullName")
    email = data.get("email")
    password = data.get("password")

    # check if user exists
    existing_user = User.objects(email=email).first()

    if existing_user:
        return jsonify({"error": "User already exists"}), 400

    # create user
    user = User(
        fullName=fullName,
        email=email,
        password=hash_password(password),
        role="user"
    )

    user.save()

    return jsonify({
        "message": "User created successfully"
    }), 200

@auth.route("/login", methods=["POST"])
def login():

    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = User.objects(email=email).first()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if not verify_password(password, user.password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_token(str(user.id), user.role)

    return jsonify({
        "token": token,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "role": user.role,
            "name": user.fullName
        }
    })