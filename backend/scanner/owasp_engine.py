"""
Advanced OWASP Top 10 Vulnerability Scanner
Includes:
- OWASP checks
- Hardcoded port scanner
A01:2025 - Broken Access Control
A02:2025 - Security Misconfiguration
A03:2025 - Software Supply Chain Failures
A04:2025 - Cryptographic Failures
A05:2025 - Injection
A06:2025 - Insecure Design
A07:2025 - Authentication Failures
A08:2025 - Software or Data Integrity Failures
A09:2025 - Security Logging and Alerting Failures
A10:2025 - Mishandling of Exceptional Conditions
"""

import requests
import socket   
import ssl
import urllib.parse
import re
from datetime import datetime, timezone

SEVERITY_SCORE = {
    "info": 1,
    "low": 2,
    "medium": 3,
    "high": 4,
    "critical": 5
}

PROBABILITY_SCORE = {
    "info": 1,
    "low": 2,
    "medium": 3,
    "high": 4,
    "critical": 5
}

def calculate_risk(results):
    total_risk = 0

    for r in results:
        severity = r.get("severity", "info")

        impact = SEVERITY_SCORE.get(severity, 1)
        probability = PROBABILITY_SCORE.get(severity, 1)

        risk = impact * probability

        r["risk_score"] = risk
        total_risk += risk

    return total_risk, results



# -----------------------------------------------------------
# Helper
# -----------------------------------------------------------

def result(name, severity, description, details="", recommendation=""):
    return {
        "name": name,
        "severity": severity,
        "description": description,
        "details": details,
        "recommendation": recommendation,
    }


# -----------------------------------------------------------
# PORT SCANNER
# -----------------------------------------------------------

def scan_ports(host, callback=None):
    if callback:
        callback("port_scan", "running")
    common_ports = {
        21: "FTP",
        22: "SSH",
        23: "Telnet",
        25: "SMTP",
        53: "DNS",
        80: "HTTP",
        110: "POP3",
        143: "IMAP",
        443: "HTTPS",
        445: "SMB",
        993: "IMAPS",
        995: "POP3S",
        3306: "MySQL",
        3389: "RDP",
        5432: "PostgreSQL",
        8080: "HTTP-ALT",
        8443: "HTTPS-ALT"
    }

    results = []

    for port, service in common_ports.items():

        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)

        try:
            sock.connect((host, port))

            results.append(result(
                "Open Port Detected",
                "medium",
                f"{service} port is open",
                f"Port {port}",
                "Close unused ports or restrict with firewall."
            ))

        except:
            pass

        finally:
            sock.close()

    if not results:
        results.append(result(
            "Port Scan",
            "info",
            "No common open ports detected"
        ))
    if callback:
        callback("port_scan", "done")

    return results


# -----------------------------------------------------------
# DIRECTORY DISCOVERY
# -----------------------------------------------------------

def directory_scan(url, callback=None):
    if callback:
        callback("dir_enum", "running")
    paths = [
    "/admin", "/administrator", "/login", "/wp-admin", "/wp-login.php",
    "/phpmyadmin", "/cpanel", "/.git", "/.git/config", "/.env",
    "/.htaccess", "/backup", "/backup.zip", "/db", "/database",
    "/server-status", "/server-info", "/.svn", "/.DS_Store",
    "/robots.txt", "/sitemap.xml", "/crossdomain.xml",
    "/wp-config.php.bak", "/config.php", "/config.yml",
    "/.well-known/security.txt", "/api", "/api/v1", "/swagger.json",
    "/graphql", "/debug", "/trace", "/elmah.axd", "/info.php",
]

    results = []

    for p in paths:

        try:
            r = requests.get(url + p, timeout=5)

            if r.status_code == 200:

                results.append(result(
                    "Sensitive Directory Found",
                    "high",
                    "Sensitive path accessible",
                    p,
                    "Protect sensitive directories."
                ))

        except:
            pass

    if not results:
        results.append(result(
            "Directory Scan",
            "info",
            "No common sensitive directories detected"
        ))
    if callback:
        callback("dir_enum", "done")
    return results


# -----------------------------------------------------------
# SECURITY HEADERS
# -----------------------------------------------------------

def check_headers(url,callback=None):
    if callback:
        callback("headers", "running")
    headers_needed = {
    "Strict-Transport-Security": {
        "severity": "high",
        "description": "HTTP Strict Transport Security (HSTS) header is missing",
        "recommendation": "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains' header"
    },
    "X-Content-Type-Options": {
        "severity": "medium",
        "description": "X-Content-Type-Options header is missing, allowing MIME-type sniffing",
        "recommendation": "Add 'X-Content-Type-Options: nosniff' header"
    },
    "X-Frame-Options": {
        "severity": "medium",
        "description": "X-Frame-Options header is missing, potential clickjacking risk",
        "recommendation": "Add 'X-Frame-Options: DENY' or 'SAMEORIGIN' header"
    },
    "Content-Security-Policy": {
        "severity": "high",
        "description": "Content-Security-Policy header is missing",
        "recommendation": "Implement a Content Security Policy to prevent XSS and data injection attacks"
    },
    "X-XSS-Protection": {
        "severity": "low",
        "description": "X-XSS-Protection header is missing",
        "recommendation": "Add 'X-XSS-Protection: 1; mode=block' header (legacy browsers)"
    },
    "Referrer-Policy": {
        "severity": "low",
        "description": "Referrer-Policy header is missing",
        "recommendation": "Add 'Referrer-Policy: strict-origin-when-cross-origin' header"
    },
    "Permissions-Policy": {
        "severity": "low",
        "description": "Permissions-Policy header is missing",
        "recommendation": "Add Permissions-Policy header to control browser feature access"
    },
}
    

    results = []

    try:
        r = requests.get(url)

        for h in headers_needed:

            if h not in r.headers:

                results.append(result(
                    "Missing Security Header",
                    "medium",
                    f"{h} not set",
                    "",
                    "Configure recommended security headers."
                ))

    except:
        pass

    if not results:
        results.append(result(
            "Header Check",
            "info",
            "Important security headers present"
        ))
    if callback:
        callback("headers", "done")

    return results


# -----------------------------------------------------------
# SQL INJECTION
# -----------------------------------------------------------

def check_sql_injection(url, callback=None):
    if callback:
        callback("sqli", "running")
    payloads = ["'", "\"", "' OR '1'='1", "\" OR \"1\"=\"1", "1; DROP TABLE users--",
                "' UNION SELECT NULL--", "1' ORDER BY 1--"]

    sql_errors = [
    r"SQL syntax.*MySQL", r"Warning.*mysql_", r"MySqlException",
    r"valid MySQL result", r"check the manual that corresponds to your MySQL",
    r"ORA-\d{5}", r"Oracle error", r"Oracle.*Driver",
    r"PostgreSQL.*ERROR", r"WARNING.*pg_",
    r"Microsoft SQL Native Client error", r"ODBC SQL Server Driver",
    r"\[SQLServer\]", r"SQLite\/JDBCDriver", r"SQLite.Exception",
    r"System.Data.SQLite.SQLiteException", r"Unclosed quotation mark",
    r"quoted string not properly terminated",
    r"SQL command not properly ended",
]

    results = []

    for payload in payloads:

        try:

            test = url + "?id=" + payload
            r = requests.get(test, timeout=5)

            for err in sql_errors:

                if err in r.text.lower():

                    results.append(result(
                        "SQL Injection",
                        "critical",
                        "Database error pattern detected",
                        payload,
                        "Use parameterized queries."
                    ))

        except:
            pass

    if not results:
        results.append(result(
            "SQL Injection Test",
            "info",
            "No SQL error patterns detected"
        ))
    if callback:
        callback("sqli", "done")
    return results


# -----------------------------------------------------------
# XSS CHECK
# -----------------------------------------------------------

def check_xss(url, callback=None):
    if callback:
        callback("xss", "running")
    payload =  [
    "<script>alert('xss')</script>",
    "<img src=x onerror=alert('xss')>",
    "'\"><script>alert('xss')</script>",
    "<svg onload=alert('xss')>",
    "javascript:alert('xss')",
    ]

    try:

       for payload in payload:
            test = url + "?q=" + urllib.parse.quote(payload)
            r = requests.get(test)

            if payload in r.text:

                return [result(
                    "Reflected XSS",
                    "high",
                    "Payload reflected in response",
                    payload,
                    "Sanitize and encode user input."
                )]

    except:
        pass

    if callback:
        callback("xss", "done")
    
    return [result(
        "XSS Test",
        "info",
        "No reflected XSS detected"
    )]


# -----------------------------------------------------------
# COOKIE SECURITY
# -----------------------------------------------------------

def check_cookies(url, callback=None):
    if callback:
        callback("cookies", "running")
    results = []

    try:

        r = requests.get(url)

        cookies = r.headers.get("Set-Cookie", "")

        if cookies:

            if "Secure" not in cookies:
                results.append(result(
                    "Cookie Security",
                    "medium",
                    "Secure flag missing",
                    "",
                    "Enable Secure cookie flag."
                ))

            if "HttpOnly" not in cookies:
                results.append(result(
                    "Cookie Security",
                    "medium",
                    "HttpOnly flag missing",
                    "",
                    "Enable HttpOnly cookie flag."
                ))

    except:
        pass

    if not results:
        results.append(result(
            "Cookie Security",
            "info",
            "Cookies appear secure"
        ))
    if callback:
        callback("cookies", "done")
    return results


# -----------------------------------------------------------
# SERVER INFO LEAK
# -----------------------------------------------------------

def check_server_info(url, callback=None):
    if callback:
        callback("info_leak", "running")    

    try:

        r = requests.get(url)

        server = r.headers.get("Server")

        if server:

            return [result(
                "Information Disclosure",
                "medium",
                "Server version exposed",
                server,
                "Hide server information."
            )]

    except:
        pass

    if callback:
        callback("info_leak", "done")   
    return [result(
        "Server Info",
        "info",
        "Server information not exposed"
    )]


# -----------------------------------------------------------
# SSL CHECK
# -----------------------------------------------------------

def check_ssl(url, callback=None):
    if callback:
        callback("ssl", "running")
    parsed = urllib.parse.urlparse(url)

    if parsed.scheme != "https":

        return [result(
            "Cryptographic Failure",
            "critical",
            "HTTPS not used",
            "",
            "Enable HTTPS."
        )]

    hostname = parsed.hostname

    try:

        context = ssl.create_default_context()

        with socket.create_connection((hostname, 443)) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:

                cert = ssock.getpeercert()

                expiry = cert["notAfter"]

                return [result(
                    "SSL Certificate",
                    "info",
                    "SSL certificate detected",
                    expiry
                )]

    except:
        pass

    if callback:
        callback("ssl", "done")
        
    return [result(
            "SSL Check",
            "medium",
            "Unable to verify SSL certificate"
    )]


# -----------------------------------------------------------
# MAIN SCANNER
# -----------------------------------------------------------

def run_scan(url, callback=None):
    if callback:
        callback("scan", "running")
    parsed = urllib.parse.urlparse(url)

    host = parsed.hostname

    checks = [
        lambda u: scan_ports(host),
        directory_scan,
        check_headers,
        check_sql_injection,
        check_xss,
        check_cookies,
        check_server_info,
        check_ssl
    ]

    results = []

    for check in checks:

        results.extend(check(url))

    if callback:
        callback("scan", "done")
    return {

        "url": url,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_tests": len(results),
        "results": results
    }