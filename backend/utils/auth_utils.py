import bcrypt
from flask import request
import jwt
import os
from datetime import datetime, timedelta

from models.user_model import User
import os

SECRET = os.getenv("JWT_SECRET", "dev_secret_key")

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode()

def verify_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id, role):
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(days=1)
    }

    token = jwt.encode(payload, SECRET, algorithm="HS256")
    return token


def get_current_user():
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None

    try:
        token = auth_header.split(" ")[1] if " " in auth_header else auth_header

        decoded = jwt.decode(token, SECRET, algorithms=["HS256"])

        user = User.objects(id=decoded["user_id"]).first()
        return user

    except Exception:
        return None

def get_current_user_from_token(token):
    if not token:
        return None

    try:
        token = token.replace("Bearer ", "")
        decoded = jwt.decode(token, SECRET, algorithms=["HS256"])

        return User.objects(id=decoded["user_id"]).first()

    except Exception:
        return None