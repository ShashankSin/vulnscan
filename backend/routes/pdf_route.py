from flask import Blueprint, send_file
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table,
    TableStyle, PageBreak
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4

from scanner.scan import run_full_scan  

pdf_bp = Blueprint("pdf", __name__)

# ─────────────────────────────────────────────
# OWASP MAPPING ENGINE
# ─────────────────────────────────────────────
def map_owasp(name: str):
    name = name.lower()

    if "sql" in name:
        return "A03: Injection"
    if "xss" in name:
        return "A07: Cross-Site Scripting"
    if "cookie" in name:
        return "A05: Security Misconfiguration"
    if "cors" in name:
        return "A05: Security Misconfiguration"
    if "ssl" in name or "tls" in name:
        return "A02: Cryptographic Failures"
    if "header" in name:
        return "A05: Security Misconfiguration"
    if "port" in name:
        return "A05: Security Misconfiguration"

    return "A05: Security Misconfiguration"


# ─────────────────────────────────────────────
# SEVERITY COLORS
# ─────────────────────────────────────────────
SEVERITY_COLORS = {
    "critical": colors.red,
    "high": colors.orange,
    "medium": colors.yellow,
    "low": colors.green,
    "info": colors.lightblue,
}


# ─────────────────────────────────────────────
# PDF ROUTE
# ─────────────────────────────────────────────
@pdf_bp.route("/scans/<scan_id>/pdf", methods=["GET"])
def download_pdf(scan_id):

    # ⚠️ Replace with DB fetch in production
    data = run_full_scan("https://example.com")

    filename = f"pentest-report-{scan_id}.pdf"
    doc = SimpleDocTemplate(filename, pagesize=A4)

    styles = getSampleStyleSheet()
    elements = []

    # ================= HEADER =================
    elements.append(
        Paragraph("🛡️ PENETRATION TEST REPORT", styles["Title"])
    )
    elements.append(Spacer(1, 10))

    elements.append(Paragraph(f"<b>Target:</b> {data['url']}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Risk Score:</b> {data['risk_score']}/100", styles["Normal"]))
    elements.append(Paragraph(f"<b>Total Findings:</b> {len(data['results'])}", styles["Normal"]))
    elements.append(Spacer(1, 20))

    # ================= EXECUTIVE SUMMARY =================
    elements.append(Paragraph("EXECUTIVE SUMMARY", styles["Heading2"]))
    elements.append(Spacer(1, 8))

    risk = data["risk_score"]

    summary = (
        "This automated penetration test analyzed the target application for "
        "security misconfigurations, injection flaws, exposed services, and information leakage. "
    )

    if risk >= 70:
        summary += "The system is HIGH RISK and requires immediate remediation."
    elif risk >= 40:
        summary += "The system has MODERATE security issues that should be addressed."
    else:
        summary += "The system shows LOW RISK with minor issues detected."

    elements.append(Paragraph(summary, styles["BodyText"]))
    elements.append(PageBreak())

    # ================= SEVERITY OVERVIEW =================
    elements.append(Paragraph("VULNERABILITY OVERVIEW", styles["Heading2"]))
    elements.append(Spacer(1, 10))

    severity = data["severity_counts"]

    table_data = [["Severity", "Count"]]
    for k, v in severity.items():
        table_data.append([k.upper(), str(v)])

    table = Table(table_data)

    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.black),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
    ]))

    elements.append(table)
    elements.append(PageBreak())

    # ================= DETAILED FINDINGS =================
    elements.append(Paragraph("DETAILED FINDINGS", styles["Heading2"]))
    elements.append(Spacer(1, 10))

    for item in data["results"]:

        severity = item["severity"]
        color = SEVERITY_COLORS.get(severity, colors.black)

        # Title
        elements.append(
            Paragraph(
                f"<b>{item['name']}</b> [{severity.upper()}]",
                styles["BodyText"]
            )
        )

        # Description
        elements.append(
            Paragraph(item.get("description", ""), styles["BodyText"])
        )

        # Recommendation
        if item.get("recommendation"):
            elements.append(
                Paragraph(f"💡 Recommendation: {item['recommendation']}", styles["BodyText"])
            )

        # OWASP mapping
        elements.append(
            Paragraph(f"🔐 OWASP: {map_owasp(item['name'])}", styles["BodyText"])
        )

        elements.append(Spacer(1, 10))

    # ================= BUILD PDF =================
    doc.build(elements)

    return send_file(filename, as_attachment=True)