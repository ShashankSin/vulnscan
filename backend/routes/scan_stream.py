from flask import Blueprint, request, Response, jsonify
import json
import threading
import uuid
import queue
from urllib.parse import urlparse
from datetime import datetime

from scanner.scan import run_full_scan  
from models.scan_model import Scan  
from utils.auth_utils import  get_current_user_from_token, get_current_user

scan_bp = Blueprint("scan", __name__)
scan_results = {} 

def _validate_url(url):
    """Validate and normalize the input URL."""
    if not url:
        return None, "URL is required"
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    parsed = urlparse(url)
    if not parsed.hostname:
        return None, "Invalid URL"
    return url, None

@scan_bp.route("/scan/stream")
def scan_stream():

    url = request.args.get("url", "")
    token = request.args.get("token")

    url, error = _validate_url(url)
    if error:
        return jsonify({"error": error}), 400

    def generate():
        try:
            progress_queue = queue.Queue()
            result_holder = {}

            def progress_callback(module_id, status):
                progress_queue.put({
                    "module": module_id,
                    "status": status
                })

            # 🧠 Run scan in thread
            def run_scan():
                try:
                    result_holder["data"] = run_full_scan(
                        url,
                        progress_callback=progress_callback
                    )
                except Exception as e:
                    result_holder["error"] = str(e)
                finally:
                    progress_queue.put(None)

            threading.Thread(target=run_scan, daemon=True).start()

            # 📡 STREAM PROGRESS
            while True:
                item = progress_queue.get()

                if item is None:
                    break

                yield f"data: {json.dumps({'type': 'progress', 'data': item})}\n\n"

            # 🧠 AUTH (AFTER SCAN FINISHES)
            current_user = get_current_user_from_token(token)

            if not current_user:
                yield f"data: {json.dumps({'type': 'error', 'message': 'Unauthorized'})}\n\n"
                return

            result = result_holder.get("data") or {}

            # 🧮 SAFETY: severity fallback
            all_results = result.get("results", [])

            severity_counts = {
                "critical": 0,
                "high": 0,
                "medium": 0,
                "low": 0,
                "info": 0
            }

            for r in all_results:
                sev = (r.get("severity") or "info").lower()
                severity_counts[sev] = severity_counts.get(sev, 0) + 1

            risk_score = (
                severity_counts["critical"] * 40 +
                severity_counts["high"] * 20 +
                severity_counts["medium"] * 10 +
                severity_counts["low"] * 5
            )

            risk_score = min(risk_score, 100)

            # 💾 SAVE TO DB
            Scan(
                user=current_user,
                url=url,
                results=all_results,
                timestamp=datetime.utcnow(),
                severity_summary=severity_counts,
                risk_score=risk_score
            ).save()

            # ✅ COMPLETE EVENT
            yield f"data: {json.dumps({'type': 'complete', 'data': result, 'complete': True})}\n\n"

        except Exception as e:
            print("❌ STREAM ERROR:", str(e))
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return Response(
        generate(),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@scan_bp.route("/scan/<scan_id>")
def get_report(scan_id):

    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    scan_doc = Scan.objects(id=scan_id, user=user).first()

    if not scan_doc:
        return jsonify({"error": "Report not found"}), 404

    return jsonify({
        "url": scan_doc.url,
        "timestamp": scan_doc.timestamp,
        "results": scan_doc.results,
        "severity_summary": scan_doc.severity_summary,
        "risk_score": scan_doc.risk_score
    })
    
@scan_bp.route("/scan", methods=["GET"])
def list_scans():

    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    scans = Scan.objects(user=user).order_by('-timestamp')

    result = [
        {
            "id": str(scan.id),
            "url": scan.url,
            "timestamp": scan.timestamp,
            "severity_summary": scan.severity_summary,
            "risk_score": scan.risk_score
        }
        for scan in scans
    ]

    return jsonify(result)