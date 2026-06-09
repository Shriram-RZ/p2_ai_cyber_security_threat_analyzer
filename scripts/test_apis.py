import json
import random
import string
import urllib.parse
import urllib.request
import http.cookiejar

BASE = "http://127.0.0.1:8000/api"

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))


def request(method, path, data=None, headers=None):
    url = BASE + path
    body = None
    hdrs = {"Accept": "application/json"}
    if headers:
        hdrs.update(headers)
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        hdrs["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=hdrs, method=method)
    try:
        with opener.open(req, timeout=30) as res:
            ct = res.headers.get("Content-Type", "")
            payload = res.read()
            if "application/json" in ct:
                return json.loads(payload.decode("utf-8")), res.status, res.headers
            return payload, res.status, res.headers
    except urllib.error.HTTPError as e:
        try:
            body = e.read().decode("utf-8")
            return json.loads(body), e.code, e.headers
        except Exception:
            return body, e.code, e.headers
    except Exception as e:
        raise


email = f"test+{random.randint(1000,9999)}@example.com"
password = "Test1234!"

results = []


def run(name, func):
    try:
        result = func()
        results.append((name, True, result))
        print(f"PASS: {name}")
    except Exception as e:
        results.append((name, False, str(e)))
        print(f"FAIL: {name} -> {e}")


run("health", lambda: request("GET", "/health"))
run("root", lambda: request("GET", "/"))

run(
    "signup",
    lambda: request(
        "POST",
        "/auth/signup",
        {"email": email, "password": password, "full_name": "Test User"},
    ),
)
run("me-after-signup", lambda: request("GET", "/auth/me"))
run("logout", lambda: request("POST", "/auth/logout"))
run(
    "login",
    lambda: request("POST", "/auth/login", {"email": email, "password": password}),
)
run("me", lambda: request("GET", "/auth/me"))
run(
    "forgot-password",
    lambda: request("POST", "/auth/forgot-password", {"email": email}),
)
forgot_resp, _, _ = request("POST", "/auth/forgot-password", {"email": email})
reset_token = forgot_resp.get("reset_token")
if reset_token:
    run("reset-password", lambda: request("POST", "/auth/reset-password", {"token": reset_token, "new_password": "Newpass123!"}))
    run("login-after-reset", lambda: request("POST", "/auth/login", {"email": email, "password": "Newpass123!"}))
else:
    print("SKIP: reset-password no token returned")

run("dashboard-overview", lambda: request("GET", "/dashboard/overview"))
run("cve-search", lambda: request("GET", "/cve/search?q=openssl"))
run("intel-feed", lambda: request("GET", "/intel/feed"))

run("phishing-scan", lambda: request("POST", "/phishing/scan", {"input_type": "url", "input_value": "http://login.example.com/verify"}))
run("phishing-history", lambda: request("GET", "/phishing/history"))

run("malware-scan", lambda: request("POST", "/malware/scan", {"filename": "evil.exe", "content_or_indicators": "powershell -enc ..."}))
run("malware-history", lambda: request("GET", "/malware/history"))

run("chat-send", lambda: request("POST", "/chat/send", {"session_id": "test-session", "message": "What is suspicious activity?"}))
run("chat-sessions", lambda: request("GET", "/chat/sessions"))
chat_sessions_resp, _, _ = request("GET", "/chat/sessions")
if isinstance(chat_sessions_resp, list) and chat_sessions_resp:
    sid = chat_sessions_resp[0]["session_id"]
    run("chat-session-messages", lambda: request("GET", f"/chat/sessions/{sid}"))
else:
    print("SKIP: chat session messages no session available")

run("threat-log-upload", lambda: request("POST", "/threats/logs", {"filename": "test.log", "log_type": "syslog", "content": "Failed password for user from 10.0.0.1"}))
logs_resp, _, _ = request("GET", "/threats/logs")
if isinstance(logs_resp, list) and logs_resp:
    log_id = logs_resp[0]["id"]
    run("threat-analyze", lambda: request("POST", f"/threats/logs/{log_id}/analyze"))
    run("threat-analyses", lambda: request("GET", "/threats/analyses"))
    analyses, _, _ = request("GET", "/threats/analyses")
    if isinstance(analyses, list) and analyses:
        aid = analyses[0]["id"]
        run("threat-analysis-detail", lambda: request("GET", f"/threats/analyses/{aid}"))
        analysis_id = aid
else:
    print("SKIP: threat analysis no log available")

if analysis_id is not None:
    def report_test():
        url = BASE + f"/threats/analyses/{analysis_id}/report.pdf"
        req = urllib.request.Request(url, method="GET")
        with opener.open(req, timeout=30) as res:
            if res.status != 200:
                raise RuntimeError(f"report.pdf returned {res.status}")
            ct = res.headers.get("Content-Type", "")
            if "application/pdf" not in ct:
                raise RuntimeError(f"report.pdf wrong content type: {ct}")
            data = res.read(10)
            if not data.startswith(b"%PDF"):
                raise RuntimeError("report.pdf content not PDF")
        return "pdf ok"

    run("threat-report-pdf", report_test)

run("attack-list", lambda: request("GET", "/attacks"))
run("incidents-list", lambda: request("GET", "/incidents"))
run("create-incident", lambda: request("POST", "/incidents", {"title": "Test incident", "summary": "Test summary", "severity": "low", "status": "open"}))
incident_resp, _, _ = request("POST", "/incidents", {"title": "Test incident 2", "summary": "Test summary", "severity": "low", "status": "open"})
if isinstance(incident_resp, dict) and incident_resp.get("id"):
    iid = incident_resp["id"]
    run("get-incident", lambda: request("GET", f"/incidents/{iid}"))
    run("update-incident", lambda: request("PATCH", f"/incidents/{iid}", {"status": "closed"}))
else:
    print("SKIP: incident detail/update no incident created")

run("notifications", lambda: request("GET", "/notifications"))
notifications_resp, _, _ = request("GET", "/notifications")
if isinstance(notifications_resp, list) and notifications_resp:
    nid = notifications_resp[0]["id"]
    run("mark-notification-read", lambda: request("POST", f"/notifications/{nid}/read"))
    run("mark-notifications-read-all", lambda: request("POST", "/notifications/read-all"))
else:
    print("SKIP: notifications no items")

run("ips", lambda: request("GET", "/ips"))
ips_resp, _, _ = request("GET", "/ips")
if isinstance(ips_resp, list) and ips_resp:
    ipid = ips_resp[0]["id"]
    run("block-ip", lambda: request("POST", f"/ips/{ipid}/block"))
    run("unblock-ip", lambda: request("POST", f"/ips/{ipid}/unblock"))
else:
    print("SKIP: ips no items")

run("live-stream", lambda: request("GET", "/live"))

print("\nSUMMARY")
for name, success, payload in results:
    print(f"{name}: {'PASS' if success else 'FAIL'}")
