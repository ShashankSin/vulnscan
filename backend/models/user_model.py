from mongoengine import Document, StringField, DateTimeField,ReferenceField
from datetime import datetime

class User(Document):
    fullName = StringField(required=True)
    email = StringField(required=True, unique=True)
    password = StringField(required=True)
    role = StringField(required=True)
    createdAt = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "users"
    }