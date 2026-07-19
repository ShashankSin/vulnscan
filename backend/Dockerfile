# ─── Base Image ──────────────────────────────────────────────────
FROM python:3.11-slim

# ─── Labels ──────────────────────────────────────────────────────
LABEL maintainer="VulnScan"
LABEL description="Website Vulnerability Scanner"
LABEL version="1.0"

# ─── Environment ─────────────────────────────────────────────────
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# ─── Working Directory ───────────────────────────────────────────
WORKDIR /app

# ─── Dependencies ────────────────────────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ─── Application Code ───────────────────────────────────────────
COPY . .

# ─── Expose Port ─────────────────────────────────────────────────
EXPOSE 5000

# ─── Health Check ────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5000/')" || exit 1

# ─── Entrypoint ──────────────────────────────────────────────────
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--threads", "4", "--timeout", "120", "app:app"]