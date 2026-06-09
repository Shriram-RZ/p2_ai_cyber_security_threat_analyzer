"""High-level AI services for threat analysis. Each function returns a normalized dict.
If the Groq AI API is unavailable, a deterministic heuristic fallback is used so that
the platform stays functional in demos / development."""
from __future__ import annotations

import re
from typing import Any

from app.ai import prompts
from app.ai.groq_client import generate_json, generate_chat, GroqError


SEVERITY_TO_SCORE = {"low": 25, "medium": 55, "high": 80, "critical": 95}


def _clamp_severity(s: str) -> str:
    s = (s or "").lower()
    return s if s in SEVERITY_TO_SCORE else "medium"


# ---------- Threat / Log analysis ----------

async def analyze_log(content: str, log_type: str = "generic") -> dict[str, Any]:
    prompt = prompts.THREAT_ANALYSIS_USER.format(log_type=log_type, content=content[:18000])
    try:
        data = await generate_json(prompt, system=prompts.THREAT_ANALYSIS_SYSTEM)
    except (GroqError, Exception):
        data = _heuristic_log_analysis(content, log_type)

    data["severity"] = _clamp_severity(data.get("severity"))
    try:
        data["score"] = float(data.get("score") or SEVERITY_TO_SCORE[data["severity"]])
    except (TypeError, ValueError):
        data["score"] = float(SEVERITY_TO_SCORE[data["severity"]])
    data.setdefault("threats", [])
    data.setdefault("recommendations", [])
    data.setdefault("attack_chain", [])
    data.setdefault("mitre_tactics", [])
    data.setdefault("summary", "Automated threat analysis completed.")
    return data


def _heuristic_log_analysis(content: str, log_type: str) -> dict[str, Any]:
    text = content.lower()
    threats = []
    if "failed password" in text or "authentication failure" in text or text.count("failed") > 3:
        threats.append({
            "type": "brute_force",
            "title": "Brute-force authentication attempts",
            "description": "Multiple failed authentication attempts detected.",
            "severity": "high",
            "indicators": ["failed login", "ssh"],
            "source_ip": _first_ip(content),
            "confidence": 78,
        })
    if "select" in text and "union" in text:
        threats.append({
            "type": "sql_injection",
            "title": "Possible SQL injection",
            "description": "UNION SELECT-style payloads observed in request logs.",
            "severity": "critical",
            "indicators": ["union", "select"],
            "source_ip": _first_ip(content),
            "confidence": 82,
        })
    if "<script" in text or "onerror=" in text:
        threats.append({
            "type": "xss",
            "title": "Cross-site scripting payload",
            "description": "Reflected XSS payload patterns detected.",
            "severity": "high",
            "indicators": ["<script>", "onerror="],
            "source_ip": _first_ip(content),
            "confidence": 75,
        })
    if not threats:
        threats.append({
            "type": "reconnaissance",
            "title": "Baseline activity",
            "description": "No high-confidence threats detected by the heuristic engine.",
            "severity": "low",
            "indicators": [],
            "source_ip": _first_ip(content),
            "confidence": 40,
        })

    severity = max((t["severity"] for t in threats), key=lambda s: SEVERITY_TO_SCORE.get(s, 0))
    return {
        "summary": f"Heuristic analysis of {log_type} logs detected {len(threats)} indicator(s).",
        "severity": severity,
        "score": SEVERITY_TO_SCORE[severity],
        "threats": threats,
        "recommendations": [
            "Block source IPs exhibiting repeated failures",
            "Enable rate limiting and WAF rules for affected endpoints",
            "Rotate credentials for impacted accounts",
        ],
        "attack_chain": ["reconnaissance", "initial access"],
        "mitre_tactics": ["TA0001", "TA0006"],
    }


def _first_ip(text: str) -> str | None:
    m = re.search(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", text)
    return m.group(0) if m else None


# ---------- Phishing ----------

async def analyze_phishing(input_type: str, value: str) -> dict[str, Any]:
    prompt = prompts.PHISHING_PROMPT.format(input_type=input_type, value=value[:6000])
    try:
        data = await generate_json(prompt)
    except Exception:
        data = _heuristic_phishing(input_type, value)
    data["verdict"] = (data.get("verdict") or "suspicious").lower()
    try:
        data["risk_score"] = float(data.get("risk_score") or 50)
    except (TypeError, ValueError):
        data["risk_score"] = 50.0
    data.setdefault("indicators", [])
    data.setdefault("explanation", "")
    data.setdefault("recommendation", "")
    return data


def _heuristic_phishing(input_type: str, value: str) -> dict[str, Any]:
    v = value.lower()
    indicators = []
    score = 20
    if any(k in v for k in ["verify your account", "urgent", "suspended", "click here", "limited time"]):
        indicators.append({"label": "Urgency language", "detail": "Uses pressure tactics"})
        score += 25
    if re.search(r"https?://[^\s]+@", v) or re.search(r"https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", v):
        indicators.append({"label": "Suspicious URL", "detail": "Embedded user info or raw IP host"})
        score += 25
    if any(tld in v for tld in [".zip", ".top", ".click", ".country", ".support"]):
        indicators.append({"label": "Suspicious TLD", "detail": "Often used for short-lived scam domains"})
        score += 15
    if "paypa1" in v or "g00gle" in v or "micros0ft" in v:
        indicators.append({"label": "Lookalike spoof", "detail": "Brand name uses character substitution"})
        score += 25
    score = min(score, 98)
    verdict = "phishing" if score >= 75 else ("suspicious" if score >= 45 else "safe")
    return {
        "verdict": verdict,
        "risk_score": score,
        "indicators": indicators,
        "explanation": "Heuristic indicators suggest this content shows phishing characteristics."
        if score >= 45
        else "No strong phishing signals detected by the heuristic engine.",
        "recommendation": "Do not click links. Report to the SOC and verify sender via a trusted channel."
        if score >= 45
        else "Treat with normal caution.",
    }


# ---------- Malware ----------

async def analyze_malware(filename: str, content: str, sha256: str | None = None) -> dict[str, Any]:
    prompt = prompts.MALWARE_PROMPT.format(
        filename=filename, sha256=sha256 or "unknown", content=content[:18000]
    )
    try:
        data = await generate_json(prompt)
    except Exception:
        data = _heuristic_malware(filename, content)
    data["severity"] = _clamp_severity(data.get("severity"))
    try:
        data["score"] = float(data.get("score") or SEVERITY_TO_SCORE[data["severity"]])
    except (TypeError, ValueError):
        data["score"] = float(SEVERITY_TO_SCORE[data["severity"]])
    data.setdefault("behaviors", [])
    data.setdefault("iocs", [])
    data.setdefault("mitigation", [])
    data.setdefault("summary", "Automated malware behavior analysis completed.")
    data.setdefault("family", None)
    return data


def _heuristic_malware(filename: str, content: str) -> dict[str, Any]:
    t = content.lower()
    behaviors = []
    severity = "low"
    if "powershell" in t and ("-enc" in t or "downloadstring" in t):
        behaviors.append({"name": "PowerShell stager", "description": "Encoded PowerShell with remote download.", "severity": "high"})
        severity = "high"
    if "vssadmin delete shadows" in t or ".locked" in t or "ransom" in t:
        behaviors.append({"name": "Ransomware behavior", "description": "Shadow copy deletion / ransom note artifacts.", "severity": "critical"})
        severity = "critical"
    if "schtasks /create" in t or "registry run key" in t or "hkcu\\software\\microsoft\\windows\\currentversion\\run" in t:
        behaviors.append({"name": "Persistence", "description": "Establishes persistence via scheduled task or run key.", "severity": "high"})
        severity = max(severity, "high", key=lambda s: SEVERITY_TO_SCORE[s])
    if not behaviors:
        behaviors.append({"name": "Static review", "description": "No high-confidence malicious indicators found.", "severity": "low"})

    return {
        "family": None,
        "severity": severity,
        "score": SEVERITY_TO_SCORE[severity],
        "summary": f"Heuristic malware analysis of {filename} flagged {len(behaviors)} behavior(s).",
        "behaviors": behaviors,
        "iocs": [],
        "mitigation": [
            "Quarantine the binary",
            "Reset affected hosts to a known-good snapshot",
            "Hunt for related IOCs across the environment",
        ],
    }


# ---------- Chat ----------

async def chat_reply(history: list[dict[str, str]]) -> str:
    try:
        return await generate_chat(history, system=prompts.CHAT_SYSTEM)
    except Exception:
        last = next((m["content"] for m in reversed(history) if m["role"] == "user"), "")
        return (
            "**CyberSentinel (offline mode)**\n\n"
            "I couldn't reach the live AI right now, but here's a generic SOC-style response:\n\n"
            f"> You asked: _{last[:240]}_\n\n"
            "1. Identify the affected asset and isolate it from the network.\n"
            "2. Capture volatile evidence (memory, netstat, process tree).\n"
            "3. Search SIEM for related IOCs across the last 24 hours.\n"
            "4. Apply the relevant compensating control (firewall block, WAF rule, credential rotation)."
        )
