# SQL Injection Practice Lab

A deliberately vulnerable Flask + SQLite website for local security practice.

## Run

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Open:

http://127.0.0.1:5000

## Pages

- `/` - Lab home
- `/vulnerable-login` - intentionally vulnerable login
- `/safe-login` - parameterized-query version
- `/users` - demo database records

## What to study

The vulnerable page builds SQL like:

```text
SELECT ... WHERE username = '<input>' AND password = '<input>'
```

The safe page uses:

```text
SELECT ... WHERE username = ? AND password = ?
```

The key lesson is that parameterized queries prevent user input from being interpreted as SQL syntax.

This project is intentionally designed for localhost practice. Do not deploy the vulnerable version to a public server.
