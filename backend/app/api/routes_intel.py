"""Suspicious IPs, notifications, incidents, attacks list, CVE search, live monitor."""
from __future__ import annotations

import asyncio
import json
import random
import time
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select, desc, func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import (
    User,
    SuspiciousIp,
    Notification,
    IncidentReport,
    AttackReport,
    ThreatAnalysis,
)
from app.schemas.threat import IncidentOut, NotificationOut

router = APIRouter(tags=["intel"])

# ---------- Suspicious IPs ----------


@router.get("/ips")
def list_ips(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(
        select(SuspiciousIp)
        .where(SuspiciousIp.user_id == user.id)
        .order_by(desc(SuspiciousIp.last_seen))
        .limit(100)
    ).all()
    return [
        {
            "id": r.id,
            "ip_address": r.ip_address,
            "country": r.country,
            "threat_type": r.threat_type,
            "severity": r.severity,
            "occurrences": r.occurrences,
            "blocked": r.blocked,
            "last_seen": r.last_seen.isoformat(),
        }
        for r in rows
    ]


@router.post("/ips/{ip_id}/block")
def block_ip(ip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = db.get(SuspiciousIp, ip_id)
    if not row or row.user_id != user.id:
        raise HTTPException(404, "Not found")
    row.blocked = True
    db.add(row)
    db.commit()
    return {"ok": True, "blocked": True}


@router.post("/ips/{ip_id}/unblock")
def unblock_ip(ip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = db.get(SuspiciousIp, ip_id)
    if not row or row.user_id != user.id:
        raise HTTPException(404, "Not found")
    row.blocked = False
    db.add(row)
    db.commit()
    return {"ok": True, "blocked": False}


# ---------- Notifications ----------


@router.get("/notifications", response_model=list[NotificationOut])
def list_notifications(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(
        select(Notification)
        .where(Notification.user_id == user.id)
        .order_by(desc(Notification.created_at))
        .limit(50)
    ).all()
    return [NotificationOut.model_validate(r) for r in rows]


@router.post("/notifications/{nid}/read")
def mark_read(nid: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = db.get(Notification, nid)
    if not row or row.user_id != user.id:
        raise HTTPException(404, "Not found")
    row.read = True
    db.add(row)
    db.commit()
    return {"ok": True}


@router.post("/notifications/read-all")
def mark_all_read(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.user_id == user.id, Notification.read.is_(False)).update(
        {Notification.read: True}, synchronize_session=False
    )
    db.commit()
    return {"ok": True}


# ---------- Attacks list ----------


@router.get("/attacks")
def list_attacks(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(50, le=200),
):
    rows = db.scalars(
        select(AttackReport)
        .where(AttackReport.user_id == user.id)
        .order_by(desc(AttackReport.created_at))
        .limit(limit)
    ).all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "attack_type": r.attack_type,
            "source_ip": r.source_ip,
            "target": r.target,
            "severity": r.severity,
            "description": r.description,
            "indicators": r.indicators,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]


# ---------- Incidents ----------


@router.get("/incidents", response_model=list[IncidentOut])
def list_incidents(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(
        select(IncidentReport)
        .where(IncidentReport.user_id == user.id)
        .order_by(desc(IncidentReport.created_at))
    ).all()
    return [IncidentOut.model_validate(r) for r in rows]


@router.post("/incidents")
def create_incident(
    payload: dict,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = IncidentReport(
        user_id=user.id,
        title=payload.get("title", "Untitled incident")[:255],
        summary=payload.get("summary", ""),
        severity=payload.get("severity", "medium"),
        status=payload.get("status", "open"),
        timeline=payload.get("timeline", []),
        artifacts=payload.get("artifacts", []),
        mitigation=payload.get("mitigation", []),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": row.id, "status": "created"}


@router.patch("/incidents/{iid}")
def update_incident(
    iid: int,
    payload: dict,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.get(IncidentReport, iid)
    if not row or row.user_id != user.id:
        raise HTTPException(404, "Not found")
    for k in ("title", "summary", "severity", "status", "timeline", "artifacts", "mitigation"):
        if k in payload:
            setattr(row, k, payload[k])
    db.add(row)
    db.commit()
    return {"ok": True}


@router.get("/incidents/{iid}")
def get_incident(iid: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = db.get(IncidentReport, iid)
    if not row or row.user_id != user.id:
        raise HTTPException(404, "Not found")
    return {
        "id": row.id,
        "title": row.title,
        "summary": row.summary,
        "severity": row.severity,
        "status": row.status,
        "timeline": row.timeline,
        "artifacts": row.artifacts,
        "mitigation": row.mitigation,
        "created_at": row.created_at.isoformat(),
    }


# ---------- CVE search (NVD proxy, no key needed for low volume) ----------


@router.get("/cve/search")
async def cve_search(q: str = Query(..., min_length=2), limit: int = Query(8, le=20)):
    url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
    params = {"keywordSearch": q, "resultsPerPage": min(limit, 20)}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(url, params=params)
            r.raise_for_status()
            payload = r.json()
        out = []
        for item in payload.get("vulnerabilities", [])[:limit]:
            cve = item.get("cve", {})
            metrics = cve.get("metrics", {})
            cvss = None
            for key in ("cvssMetricV31", "cvssMetricV30", "cvssMetricV2"):
                if key in metrics and metrics[key]:
                    cvss = metrics[key][0].get("cvssData", {}).get("baseScore")
                    if cvss is not None:
                        break
            descs = cve.get("descriptions", [])
            description = next((d.get("value") for d in descs if d.get("lang") == "en"), "")
            out.append(
                {
                    "id": cve.get("id"),
                    "published": cve.get("published"),
                    "lastModified": cve.get("lastModified"),
                    "cvss": cvss,
                    "description": description,
                }
            )
        return {"query": q, "results": out}
    except Exception as e:  # noqa: BLE001
        return {"query": q, "results": [], "error": str(e)[:200]}


# ---------- Live monitoring (SSE simulated stream) ----------

ATTACK_SAMPLES = [
    ("brute_force", "SSH brute-force", "high"),
    ("sql_injection", "Suspicious UNION SELECT in /api/products", "critical"),
    ("xss", "Reflected XSS payload in search", "high"),
    ("ddos", "Volumetric SYN flood", "critical"),
    ("phishing", "Spoofed login domain visited", "medium"),
    ("malware", "Beaconing to known C2", "critical"),
    ("reconnaissance", "Port scan from external host", "low"),
    ("privilege_escalation", "Sudo to root from non-admin", "high"),
    ("data_exfiltration", "Large outbound transfer to TOR exit", "critical"),
    ("suspicious_login", "Login from unusual geolocation", "medium"),
]
COUNTRIES = ["US", "RU", "CN", "BR", "IN", "DE", "NG", "VN", "IR", "KP"]


def _rand_ip() -> str:
    return ".".join(str(random.randint(1, 254)) for _ in range(4))


@router.get("/live")
async def live_stream(user: User = Depends(get_current_user)):
    async def event_gen():
        # initial hello
        yield f"event: hello\ndata: {json.dumps({'ts': time.time()})}\n\n"
        for _ in range(120):  # ~ 2 minutes of events
            await asyncio.sleep(random.uniform(0.6, 1.6))
            atype, title, severity = random.choice(ATTACK_SAMPLES)
            evt = {
                "id": int(time.time() * 1000) + random.randint(0, 999),
                "ts": datetime.now(timezone.utc).isoformat(),
                "type": atype,
                "title": title,
                "severity": severity,
                "source_ip": _rand_ip(),
                "country": random.choice(COUNTRIES),
                "target": random.choice(["api-gateway", "auth-svc", "vault", "k8s-prod", "db-primary"]),
            }
            yield f"event: threat\ndata: {json.dumps(evt)}\n\n"
        yield "event: done\ndata: {}\n\n"

    return StreamingResponse(event_gen(), media_type="text/event-stream")


# ---------- Threat intelligence feed (curated static + dynamic facts) ----------


@router.get("/intel/feed")
def intel_feed(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    high_sev = db.scalar(
        select(func.count()).select_from(ThreatAnalysis).where(
            ThreatAnalysis.user_id == user.id,
            ThreatAnalysis.severity.in_(["high", "critical"]),
        )
    ) or 0
    return {
        "global_alerts": [
            {
                "id": "ti-001",
                "title": "ALPHV/BlackCat affiliates pivot to ESXi targeting",
                "severity": "critical",
                "source": "MITRE",
                "tags": ["ransomware", "esxi", "alphv"],
                "ts": datetime.now(timezone.utc).isoformat(),
            },
            {
                "id": "ti-002",
                "title": "Mass exploitation of CVE-2024-3400 (PAN-OS)",
                "severity": "high",
                "source": "CISA KEV",
                "tags": ["cve", "panos", "perimeter"],
                "ts": datetime.now(timezone.utc).isoformat(),
            },
            {
                "id": "ti-003",
                "title": "Credential stuffing surge against retail SSO",
                "severity": "high",
                "source": "OSINT",
                "tags": ["account_takeover", "credential_stuffing"],
                "ts": datetime.now(timezone.utc).isoformat(),
            },
            {
                "id": "ti-004",
                "title": "New phishing kit imitating Microsoft 365 device-code flow",
                "severity": "medium",
                "source": "Internal",
                "tags": ["phishing", "m365"],
                "ts": datetime.now(timezone.utc).isoformat(),
            },
        ],
        "tenant_summary": {"high_severity_24h": int(high_sev)},
    }
