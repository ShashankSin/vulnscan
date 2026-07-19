"""
Website Vulnerability Scanner - Core Scanning Engine
Performs 10 security checks against a target URL and returns
structured vulnerability results.
"""

import socket
import ssl
import re
import time
import json
import urllib.parse
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
import urllib3

# Suppress SSL warnings for scanning purposes
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ─── Constants ────────────────────────────────────────────────────────────────

COMMON_PORTS = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445,
                993, 995, 3306, 3389, 5432, 8080, 8443]

SENSITIVE_PATHS = [
    "/admin", "/administrator", "/login", "/wp-admin", "/wp-login.php",
    "/phpmyadmin", "/cpanel", "/.git", "/.git/config", "/.env",
    "/.htaccess", "/backup", "/backup.zip", "/db", "/database",
    "/server-status", "/server-info", "/.svn", "/.DS_Store",
    "/robots.txt", "/sitemap.xml", "/crossdomain.xml",
    "/wp-config.php.bak", "/config.php", "/config.yml",
    "/.well-known/security.txt", "/api", "/api/v1", "/swagger.json",
    "/graphql", "/debug", "/trace", "/elmah.axd", "/info.php",
]

SECURITY_HEADERS = {
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

SQL_PAYLOADS = ["'", "\"", "' OR '1'='1", "\" OR \"1\"=\"1", "1; DROP TABLE users--",
                "' UNION SELECT NULL--", "1' ORDER BY 1--"]

SQL_ERROR_PATTERNS = [
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

XSS_PAYLOADS = [
    "<script>alert('xss')</script>",
    "<img src=x onerror=alert('xss')>",
    "'\"><script>alert('xss')</script>",
    "<svg onload=alert('xss')>",
    "javascript:alert('xss')",
]

USER_AGENT = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

REQUEST_TIMEOUT = 10


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _make_result(name, severity, description, details="", recommendation=""):
    """Create a standardised vulnerability result dict."""
    return {
        "name": name,
        "severity": severity,  # critical | high | medium | low | info
        "description": description,
        "details": details,
        "recommendation": recommendation,
    }


def _get_hostname(url):
    """Extract hostname from URL."""
    parsed = urllib.parse.urlparse(url)
    return parsed.hostname


def _base_url(url):
    """Normalise URL to scheme + netloc."""
    parsed = urllib.parse.urlparse(url)
    return f"{parsed.scheme}://{parsed.netloc}"


def _session():
    """Return a requests Session with a realistic User-Agent."""
    s = requests.Session()
    s.headers.update({"User-Agent": USER_AGENT})
    s.verify = False  # allow self-signed certs during scanning
    return s


# ─── Scan Modules ─────────────────────────────────────────────────────────────

def check_headers(url, callback=None):
    """1. HTTP Security Header Analysis"""
    results = []
    if callback:
        callback("header_analysis", "running")
    try:
        sess = _session()
        resp = sess.get(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        headers = resp.headers

        present = []
        for header, meta in SECURITY_HEADERS.items():
            if header.lower() not in {k.lower() for k in headers}:
                results.append(_make_result(
                    name=f"Missing Header: {header}",
                    severity=meta["severity"],
                    description=meta["description"],
                    details=f"The response does not include the '{header}' header.",
                    recommendation=meta["recommendation"],
                ))
            else:
                present.append(header)

        if present:
            results.append(_make_result(
                name="Security Headers Present",
                severity="info",
                description=f"{len(present)} security headers are correctly set.",
                details=", ".join(present),
            ))
    except requests.RequestException as e:
        results.append(_make_result(
            name="Header Analysis Error",
            severity="info",
            description=f"Could not analyse headers: {e}",
        ))
    if callback:
        callback("header_analysis", "done")
    return results


def check_ssl(url, callback=None):
    """2. SSL / TLS Certificate Check"""
    results = []
    if callback:
        callback("ssl_tls", "running")
    hostname = _get_hostname(url)
    if not hostname:
        return results

    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=REQUEST_TIMEOUT) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                protocol = ssock.version()

                # Expiry check
                not_after = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
                days_left = (not_after - datetime.now(timezone.utc)).days

                if days_left < 0:
                    results.append(_make_result(
                        name="SSL Certificate Expired",
                        severity="critical",
                        description="The SSL certificate has expired.",
                        details=f"Expired on {cert['notAfter']}",
                        recommendation="Renew the SSL certificate immediately.",
                    ))
                elif days_left < 30:
                    results.append(_make_result(
                        name="SSL Certificate Expiring Soon",
                        severity="high",
                        description=f"SSL certificate expires in {days_left} days.",
                        details=f"Expires on {cert['notAfter']}",
                        recommendation="Renew the SSL certificate before expiry.",
                    ))
                else:
                    results.append(_make_result(
                        name="SSL Certificate Valid",
                        severity="info",
                        description=f"SSL certificate is valid for {days_left} more days.",
                        details=f"Issuer: {dict(cert['issuer'][0]).get('organizationName', 'N/A')}, "
                                f"Expires: {cert['notAfter']}, Protocol: {protocol}",
                    ))

                # Weak protocol check
                if protocol in ("TLSv1", "TLSv1.1", "SSLv3", "SSLv2"):
                    results.append(_make_result(
                        name="Weak TLS Protocol",
                        severity="high",
                        description=f"Server supports outdated protocol: {protocol}",
                        details=f"Negotiated protocol: {protocol}",
                        recommendation="Disable TLS 1.0/1.1 and SSLv3. Use TLS 1.2+ only.",
                    ))
    except ssl.SSLCertVerificationError as e:
        results.append(_make_result(
            name="SSL Certificate Verification Failed",
            severity="high",
            description="SSL certificate could not be verified.",
            details=str(e),
            recommendation="Ensure a valid certificate is installed from a trusted CA.",
        ))
    except (socket.timeout, ConnectionRefusedError, OSError):
        results.append(_make_result(
            name="SSL/TLS Not Available",
            severity="info",
            description="Could not establish SSL/TLS connection on port 443.",
            details="The server may not support HTTPS.",
            recommendation="Enable HTTPS with a valid SSL certificate.",
        ))
    if callback:
        callback("ssl_tls", "done")
    return results


def check_ports(url, callback=None):
    """3. Port Scanning"""
    results = []
    if callback:
        callback("port_scan", "running")
    hostname = _get_hostname(url)
    if not hostname:
        return results

    open_ports = []

    def _scan_port(port):
        try:
            with socket.create_connection((hostname, port), timeout=3):
                return port
        except (socket.timeout, ConnectionRefusedError, OSError):
            return None

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(_scan_port, p): p for p in COMMON_PORTS}
        for future in as_completed(futures):
            result = future.result()
            if result is not None:
                open_ports.append(result)

    open_ports.sort()

    if open_ports:
        svc_map = {
            21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS",
            80: "HTTP", 110: "POP3", 143: "IMAP", 443: "HTTPS", 445: "SMB",
            993: "IMAPS", 995: "POP3S", 3306: "MySQL", 3389: "RDP",
            5432: "PostgreSQL", 8080: "HTTP-Alt", 8443: "HTTPS-Alt",
        }
        port_details = [f"{p} ({svc_map.get(p, 'Unknown')})" for p in open_ports]

        risky = [p for p in open_ports if p in (21, 23, 445, 3306, 3389, 5432)]
        if risky:
            results.append(_make_result(
                name="Potentially Risky Open Ports",
                severity="high",
                description=f"Found {len(risky)} potentially risky open port(s).",
                details=", ".join(str(p) for p in risky),
                recommendation="Close unnecessary ports or restrict access with a firewall.",
            ))

        results.append(_make_result(
            name="Open Ports Detected",
            severity="info",
            description=f"{len(open_ports)} open port(s) found.",
            details=", ".join(port_details),
        ))
    else:
        results.append(_make_result(
            name="Port Scan Complete",
            severity="info",
            description="No open ports detected from the common port list.",
        ))
    if callback:
        callback("port_scan", "done")
    return results


def check_technology(url, callback=None):
    """4. Technology Detection"""
    results = []
    if callback:
        callback("tech_detection", "running")
    try:
        sess = _session()
        resp = sess.get(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        detected = []

        # Server header
        server = resp.headers.get("Server", "")
        if server:
            detected.append(f"Server: {server}")

        # X-Powered-By
        powered = resp.headers.get("X-Powered-By", "")
        if powered:
            detected.append(f"X-Powered-By: {powered}")

        body = resp.text.lower()

        # CMS / Framework detection
        tech_sigs = {
            "WordPress": ["wp-content", "wp-includes", "wordpress"],
            "Joomla": ["joomla", "/media/system/js/"],
            "Drupal": ["drupal", "sites/default/files"],
            "Django": ["csrfmiddlewaretoken", "__admin__"],
            "Laravel": ["laravel_session", "laravel"],
            "React": ["react", "_react", "react-root"],
            "Angular": ["ng-version", "ng-app"],
            "Vue.js": ["vue.js", "vue.min.js", "__vue__"],
            "jQuery": ["jquery"],
            "Bootstrap": ["bootstrap"],
            "Next.js": ["__next", "_next/static"],
            "ASP.NET": ["__viewstate", "asp.net"],
            "Express": [],
            "Nginx": [],
            "Apache": [],
        }

        for tech, signatures in tech_sigs.items():
            for sig in signatures:
                if sig in body or sig.lower() in server.lower() or sig.lower() in powered.lower():
                    detected.append(tech)
                    break

        if detected:
            results.append(_make_result(
                name="Technologies Detected",
                severity="info",
                description=f"Identified {len(detected)} technolog{'y' if len(detected) == 1 else 'ies'}.",
                details=", ".join(list(dict.fromkeys(detected))),  # deduplicate
            ))

            # Flag version leakage
            if server and any(c.isdigit() for c in server):
                results.append(_make_result(
                    name="Server Version Disclosed",
                    severity="medium",
                    description="The server header discloses version information.",
                    details=f"Server: {server}",
                    recommendation="Remove or obfuscate the Server header to reduce information exposure.",
                ))
        else:
            results.append(_make_result(
                name="Technology Detection",
                severity="info",
                description="Could not identify specific technologies.",
            ))
    except requests.RequestException as e:
        results.append(_make_result(
            name="Technology Detection Error",
            severity="info",
            description=f"Could not perform technology detection: {e}",
        ))
    if callback:
        callback("tech_detection", "done")
    return results


def check_directories(url, callback=None):
    """5. Directory / Sensitive File Enumeration"""
    results = []
    if callback:
        callback("dir_enum", "running")
    base = _base_url(url)
    found = []
    sess = _session()

    for path in SENSITIVE_PATHS:
        try:
            resp = sess.get(f"{base}{path}", timeout=5, allow_redirects=False)
            if resp.status_code == 200:
                found.append({"path": path, "status": 200, "size": len(resp.content)})
            elif resp.status_code in (301, 302, 403):
                found.append({"path": path, "status": resp.status_code, "size": 0})
        except requests.RequestException:
            continue

    accessible = [f for f in found if f["status"] == 200]
    restricted = [f for f in found if f["status"] == 403]

    if accessible:
        critical_paths = [f["path"] for f in accessible if any(
            s in f["path"] for s in [".git", ".env", ".htaccess", "backup", "config", "debug"]
        )]
        if critical_paths:
            results.append(_make_result(
                name="Sensitive Files Accessible",
                severity="critical",
                description=f"{len(critical_paths)} sensitive file(s)/path(s) are publicly accessible.",
                details=", ".join(critical_paths),
                recommendation="Restrict access to sensitive files and directories immediately.",
            ))

        results.append(_make_result(
            name="Accessible Paths Found",
            severity="medium" if not critical_paths else "info",
            description=f"{len(accessible)} path(s) returned HTTP 200.",
            details=", ".join(f"{f['path']} ({f['size']} bytes)" for f in accessible),
            recommendation="Review accessible paths and restrict those not intended to be public.",
        ))

    if restricted:
        results.append(_make_result(
            name="Restricted Paths Detected",
            severity="info",
            description=f"{len(restricted)} path(s) returned 403 Forbidden.",
            details=", ".join(f["path"] for f in restricted),
        ))

    if not found:
        results.append(_make_result(
            name="Directory Enumeration",
            severity="info",
            description="No common sensitive paths were found.",
        ))
    if callback:
        callback("dir_enum", "done")
    return results


def check_sqli(url, callback=None):
    """6. SQL Injection Detection"""
    results = []
    if callback:
        callback("sqli", "running")
    parsed = urllib.parse.urlparse(url)
    params = urllib.parse.parse_qs(parsed.query)

    if not params:
        # Try adding a test parameter
        test_url = url + ("&" if "?" in url else "?") + "id=1"
        parsed = urllib.parse.urlparse(test_url)
        params = urllib.parse.parse_qs(parsed.query)

    if not params:
        results.append(_make_result(
            name="SQL Injection Test",
            severity="info",
            description="No query parameters found to test for SQL injection.",
            recommendation="Manually test forms and API endpoints for SQL injection.",
        ))
        if callback:
            callback("sqli", "done")
        return results

    sess = _session()
    vulnerable_params = []

    for param in params:
        for payload in SQL_PAYLOADS:
            try:
                test_params = dict(params)
                test_params[param] = payload
                query = urllib.parse.urlencode(test_params, doseq=True)
                test_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}?{query}"

                resp = sess.get(test_url, timeout=REQUEST_TIMEOUT)
                body = resp.text

                for pattern in SQL_ERROR_PATTERNS:
                    if re.search(pattern, body, re.IGNORECASE):
                        vulnerable_params.append((param, payload, pattern))
                        break
            except requests.RequestException:
                continue

    if vulnerable_params:
        details = "; ".join(
            f"Param '{p}' with payload '{pl}'" for p, pl, _ in vulnerable_params
        )
        results.append(_make_result(
            name="Potential SQL Injection",
            severity="critical",
            description=f"SQL error patterns detected in {len(vulnerable_params)} test(s).",
            details=details,
            recommendation="Use parameterized queries/prepared statements. Never concatenate user input into SQL.",
        ))
    else:
        results.append(_make_result(
            name="SQL Injection Test",
            severity="info",
            description="No SQL injection vulnerabilities detected via error-based testing.",
            recommendation="Consider deeper testing with authenticated sessions.",
        ))
    if callback:
        callback("sqli", "done")
    return results


def check_xss(url, callback=None):
    """7. XSS Detection"""
    results = []
    if callback:
        callback("xss", "running")
    parsed = urllib.parse.urlparse(url)
    params = urllib.parse.parse_qs(parsed.query)

    if not params:
        test_url = url + ("&" if "?" in url else "?") + "q=test"
        parsed = urllib.parse.urlparse(test_url)
        params = urllib.parse.parse_qs(parsed.query)

    if not params:
        results.append(_make_result(
            name="XSS Test",
            severity="info",
            description="No query parameters found to test for XSS.",
            recommendation="Manually test forms and input fields for XSS vulnerabilities.",
        ))
        if callback:
            callback("xss", "done")
        return results

    sess = _session()
    reflected = []

    for param in params:
        for payload in XSS_PAYLOADS:
            try:
                test_params = dict(params)
                test_params[param] = payload
                query = urllib.parse.urlencode(test_params, doseq=True)
                test_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}?{query}"

                resp = sess.get(test_url, timeout=REQUEST_TIMEOUT)
                if payload in resp.text:
                    reflected.append((param, payload))
                    break
            except requests.RequestException:
                continue

    if reflected:
        details = "; ".join(f"Param '{p}' reflected payload" for p, _ in reflected)
        results.append(_make_result(
            name="Reflected XSS Detected",
            severity="high",
            description=f"XSS payload reflected in {len(reflected)} parameter(s).",
            details=details,
            recommendation="Sanitize and encode all user inputs. Implement Content-Security-Policy.",
        ))
    else:
        results.append(_make_result(
            name="XSS Test",
            severity="info",
            description="No reflected XSS vulnerabilities detected.",
        ))
    if callback:
        callback("xss", "done")
    return results


def check_cors(url, callback=None):
    """8. CORS Misconfiguration Check"""
    results = []
    if callback:
        callback("cors", "running")
    try:
        sess = _session()
        evil_origin = "https://evil-attacker.com"
        resp = sess.get(url, timeout=REQUEST_TIMEOUT,
                        headers={"Origin": evil_origin}, allow_redirects=True)

        acao = resp.headers.get("Access-Control-Allow-Origin", "")
        acac = resp.headers.get("Access-Control-Allow-Credentials", "").lower()

        if acao == "*":
            sev = "high" if acac == "true" else "medium"
            results.append(_make_result(
                name="CORS Wildcard Origin",
                severity=sev,
                description="CORS is configured with a wildcard (*) origin.",
                details=f"Access-Control-Allow-Origin: {acao}, Allow-Credentials: {acac}",
                recommendation="Restrict allowed origins to trusted domains only.",
            ))
        elif evil_origin in acao:
            results.append(_make_result(
                name="CORS Origin Reflection",
                severity="critical",
                description="The server reflects arbitrary origins in CORS headers.",
                details=f"Sent Origin: {evil_origin}, Received ACAO: {acao}",
                recommendation="Validate and whitelist allowed origins server-side.",
            ))
        elif acao:
            results.append(_make_result(
                name="CORS Configured",
                severity="info",
                description="CORS headers are present with specific origin restrictions.",
                details=f"Access-Control-Allow-Origin: {acao}",
            ))
        else:
            results.append(_make_result(
                name="No CORS Headers",
                severity="info",
                description="No CORS headers detected in the response.",
            ))
    except requests.RequestException as e:
        results.append(_make_result(
            name="CORS Check Error",
            severity="info",
            description=f"Could not check CORS: {e}",
        ))
    if callback:
        callback("cors", "done")
    return results


def check_cookies(url, callback=None):
    """9. Cookie Security Analysis"""
    results = []
    if callback:
        callback("cookies", "running")
    try:
        sess = _session()
        resp = sess.get(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        cookies = resp.cookies

        if not cookies:
            results.append(_make_result(
                name="Cookie Analysis",
                severity="info",
                description="No cookies were set by the server.",
            ))
            if callback:
                callback("cookies", "done")
            return results

        insecure = []
        for cookie in cookies:
            issues = []
            if not cookie.secure:
                issues.append("Missing Secure flag")
            if "httponly" not in str(cookie._rest).lower() and not getattr(cookie, "has_nonstandard_attr", lambda x: False)("httponly"):
                issues.append("Missing HttpOnly flag")
            if not cookie.get_nonstandard_attr("SameSite"):
                issues.append("Missing SameSite attribute")
            if issues:
                insecure.append({"name": cookie.name, "issues": issues})

        if insecure:
            details = "; ".join(
                f"'{c['name']}': {', '.join(c['issues'])}" for c in insecure
            )
            results.append(_make_result(
                name="Insecure Cookies",
                severity="medium",
                description=f"{len(insecure)} cookie(s) have security issues.",
                details=details,
                recommendation="Set Secure, HttpOnly, and SameSite attributes on all cookies.",
            ))
        else:
            results.append(_make_result(
                name="Cookie Security",
                severity="info",
                description="All cookies have proper security attributes.",
            ))
    except requests.RequestException as e:
        results.append(_make_result(
            name="Cookie Check Error",
            severity="info",
            description=f"Could not analyse cookies: {e}",
        ))
    if callback:
        callback("cookies", "done")
    return results


def check_info_disclosure(url, callback=None):
    """10. Information Disclosure Detection"""
    results = []
    if callback:
        callback("info_disclosure", "running")
    try:
        sess = _session()
        resp = sess.get(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        body = resp.text
        headers = resp.headers

        # Email addresses
        emails = list(set(re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', body)))
        if emails:
            results.append(_make_result(
                name="Email Addresses Exposed",
                severity="low",
                description=f"{len(emails)} email address(es) found in page source.",
                details=", ".join(emails[:10]),
                recommendation="Obfuscate email addresses or use contact forms.",
            ))

        # Internal IPs
        internal_ips = list(set(re.findall(
            r'\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b',
            body + str(headers)
        )))
        if internal_ips:
            results.append(_make_result(
                name="Internal IP Addresses Exposed",
                severity="medium",
                description=f"Internal IP address(es) found in response.",
                details=", ".join(internal_ips),
                recommendation="Remove internal IP addresses from public responses.",
            ))

        # Server version in header
        server = headers.get("Server", "")
        via = headers.get("Via", "")
        x_powered = headers.get("X-Powered-By", "")

        disclosures = []
        if server and any(c.isdigit() for c in server):
            disclosures.append(f"Server: {server}")
        if x_powered:
            disclosures.append(f"X-Powered-By: {x_powered}")
        if via:
            disclosures.append(f"Via: {via}")

        if disclosures:
            results.append(_make_result(
                name="Server Information Disclosed",
                severity="low",
                description="Response headers disclose server/technology information.",
                details=", ".join(disclosures),
                recommendation="Remove or obfuscate server version headers.",
            ))

        # HTML comments with potential secrets
        comments = re.findall(r'<!--(.*?)-->', body, re.DOTALL)
        suspicious = [c.strip() for c in comments if any(
            kw in c.lower() for kw in ["password", "secret", "api_key", "token", "todo", "fixme", "hack", "debug"]
        )]
        if suspicious:
            results.append(_make_result(
                name="Suspicious HTML Comments",
                severity="medium",
                description=f"Found {len(suspicious)} HTML comment(s) with potentially sensitive content.",
                details="; ".join(s[:100] for s in suspicious[:5]),
                recommendation="Remove all comments containing sensitive information from production code.",
            ))

        if not results:
            results.append(_make_result(
                name="Information Disclosure",
                severity="info",
                description="No significant information disclosure detected.",
            ))

    except requests.RequestException as e:
        results.append(_make_result(
            name="Info Disclosure Check Error",
            severity="info",
            description=f"Could not check for information disclosure: {e}",
        ))
    if callback:
        callback("info_disclosure", "done")
    return results


# ─── Orchestrator ─────────────────────────────────────────────────────────────

SCAN_MODULES = [
    {"id": "header_analysis",  "name": "Header Analysis",        "fn": check_headers},
    {"id": "ssl_tls",          "name": "SSL/TLS Check",           "fn": check_ssl},
    {"id": "port_scan",        "name": "Port Scanning",           "fn": check_ports},
    {"id": "tech_detection",   "name": "Technology Detection",    "fn": check_technology},
    {"id": "dir_enum",         "name": "Directory Enumeration",   "fn": check_directories},
    {"id": "sqli",             "name": "SQL Injection Test",      "fn": check_sqli},
    {"id": "xss",              "name": "XSS Detection",           "fn": check_xss},
    {"id": "cors",             "name": "CORS Check",              "fn": check_cors},
    {"id": "cookies",          "name": "Cookie Security",         "fn": check_cookies},
    {"id": "info_disclosure",  "name": "Info Disclosure",         "fn": check_info_disclosure},
]


def run_full_scan(url, progress_callback=None):
    """
    Run all scan modules sequentially against the given URL.

    Args:
        url: Target URL to scan.
        progress_callback: Optional callable(module_id, status) for progress updates.

    Returns:
        dict with scan metadata and all vulnerability results.
    """
    start_time = time.time()
    all_results = []

    for module in SCAN_MODULES:
        try:
            module_results = module["fn"](url, callback=progress_callback)
            all_results.extend(module_results)
        except Exception as e:
            all_results.append(_make_result(
                name=f"{module['name']} Error",
                severity="info",
                description=f"Module failed: {e}",
            ))
            if progress_callback:
                progress_callback(module["id"], "error")

    elapsed = round(time.time() - start_time, 2)

    # Severity summary
    severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
    for r in all_results:
        severity_counts[r["severity"]] = severity_counts.get(r["severity"], 0) + 1

    risk_score = (
        severity_counts["critical"] * 40 +
        severity_counts["high"] * 20 +
        severity_counts["medium"] * 10 +
        severity_counts["low"] * 5
    )
    risk_score = min(risk_score, 100)

    return {
        "url": url,
        "scan_time": elapsed,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_checks": len(all_results),
        "severity_counts": severity_counts,
        "risk_score": risk_score,
        "results": all_results,
    }