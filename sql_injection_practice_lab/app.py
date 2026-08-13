from flask import Flask, request, render_template, g
import sqlite3
import os

app = Flask(__name__)
DATABASE = os.path.join(os.path.dirname(__file__), "demo.db")


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = sqlite3.connect(DATABASE)
    cur = db.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    """)

    cur.execute("SELECT COUNT(*) FROM users")
    if cur.fetchone()[0] == 0:
        cur.executemany(
            "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
            [
                ("alice", "alice123", "user"),
                ("bob", "bob123", "user"),
                ("admin", "admin123", "admin"),
            ],
        )

    db.commit()
    db.close()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/vulnerable-login", methods=["GET", "POST"])
def vulnerable_login():
    result = None
    query = None

    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")

        # INTENTIONALLY VULNERABLE:
        # User input is concatenated directly into SQL.
        query = (
            "SELECT id, username, role FROM users "
            f"WHERE username = '{username}' AND password = '{password}'"
        )

        try:
            rows = get_db().execute(query).fetchall()
            result = rows
        except sqlite3.Error as e:
            result = f"SQL error: {e}"

    return render_template(
        "vulnerable.html",
        result=result,
        query=query,
    )


@app.route("/safe-login", methods=["GET", "POST"])
def safe_login():
    result = None

    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")

        # SAFE VERSION:
        # Parameterized query keeps input separate from SQL code.
        query = (
            "SELECT id, username, role FROM users "
            "WHERE username = ? AND password = ?"
        )

        result = get_db().execute(query, (username, password)).fetchall()

    return render_template("safe.html", result=result)


@app.route("/users")
def users():
    rows = get_db().execute(
        "SELECT id, username, role FROM users"
    ).fetchall()
    return render_template("users.html", users=rows)


if __name__ == "__main__":
    init_db()
    print("SQL Injection Demo running on http://127.0.0.3:4000")
    app.run(host="127.0.0.3", port=4000, debug=True)
