from mongoengine import Document, StringField, DateTimeField, ListField, DictField, IntField, ReferenceField
from datetime import datetime
from models.user_model import User 

class Scan(Document):
    user = ReferenceField(User, required=True) 
    url = StringField(required=True)
    timestamp = DateTimeField(default=datetime.utcnow)
    results = ListField(DictField())
    risk_score = IntField(default=0)
    severity_summary = DictField(default={})

    meta = {
        "collection": "scans"
    }