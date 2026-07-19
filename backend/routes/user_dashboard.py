from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta

from models.scan_model import Scan
from utils.auth_utils import get_current_user

dashboard_bp = Blueprint("dashboard", __name__)


def extract_domain(url):
    return url.replace("https://", "").replace("http://", "").split("/")[0]


# 📊 USER DASHBOARD STATS
@dashboard_bp.route("/dashboard", methods=["GET"])
def get_dashboard():
    try:
        user = get_current_user()

        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        thirty_days_ago = datetime.utcnow() - timedelta(days=30)

        scans = Scan.objects(
            user=user,
            timestamp__gte=thirty_days_ago
        )

        total_scans = scans.count()

        critical_threats = 0
        total_threats = 0
        completed_scans = 0

        for s in scans:
            if s.results:
                total_threats += len(s.results)

            if s.risk_score >= 7:
                critical_threats += 1

            completed_scans += 1

        success_rate = (
            round((completed_scans / total_scans) * 100, 2)
            if total_scans > 0 else 0
        )

        return jsonify({
            "totalScans": total_scans,
            "criticalThreats": critical_threats,
            "totalThreats": total_threats,
            "successRate": success_rate,
            "avgScanTime": "4.2m"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 📄 RECENT SCANS
@dashboard_bp.route("/scans/recent", methods=["GET"])
def recent_scans():
    try:
        user = get_current_user()

        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        scans = Scan.objects(user=user)\
            .order_by("-timestamp")\
            .limit(10)

        result = []

        for s in scans:
            result.append({
                "id": str(s.id),
                "domain": extract_domain(s.url),
                "status": "Completed",
                "threats": len(s.results) if s.results else 0,
                "date": s.timestamp.strftime("%Y-%m-%d")
            })

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500