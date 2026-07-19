from models.user_model import User
from db import init_db
from utils.auth_utils import hash_password

init_db()

admin = User.objects(email="admin@vulnscan.com").first()

if not admin:
    User(
        fullName="Super Admin",
        email="admin@vulnscan.com",
        password=hash_password("Admin@123"),
        role="superadmin"
    ).save()

    print("Superadmin created!")
else:
    print("Superadmin already exists.")