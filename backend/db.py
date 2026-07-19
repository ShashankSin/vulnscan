from mongoengine import connect

def init_db():
    connect(
        db="vulnscan",
        host="mongodb://localhost:27017/vulnscan"
    )