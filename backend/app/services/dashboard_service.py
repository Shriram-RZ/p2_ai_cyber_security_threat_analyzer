"""Aggregations for the SOC overview dashboard."""
from __future__ import annotations

from collections import Counter
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, func, desc
from sqlalchemy.orm import Session

from app.models import (
    ThreatAnalysis,
    AttackReport,
    PhishingAnalysis,
    MalwareAnalysis,
    SuspiciousIp,
    IncidentReport,
    Notification,
)

SEVERITY_RANK = {"low": 1, "medium": 2, "high": 3, "critical": 4}


def get_overview(db: Session, user_id: int) -> dict:
    threats_total = db.scalar(
        select(func.count()).select_from(ThreatAnalysis).where(ThreatAnalysis.user_id == user_id)
    ) or 0
    critical_total = db.scalar(
        select(func.count()).select_from(ThreatAnalysis).where(
            ThreatAnalysis.user_id == user_id,
            ThreatAnalysis.severity.in_(["high", "critical"]),
        )
    ) or 0
    blocked_ips = db.scalar(
        select(func.count()).select_from(SuspiciousIp).where(
            SuspiciousIp.user_id == user_id, SuspiciousIp.blocked.is_(True)
        )
    ) or 0
    open_incidents = db.scalar(
        select(func.count()).select_from(IncidentReport).where(
            IncidentReport.user_id == user_id, IncidentReport.status == "open"
        )
    ) or 0
    malware_alerts = db.scalar(
        select(func.count()).select_from(MalwareAnalysis).where(
            MalwareAnalysis.user_id == user_id,
            MalwareAnalysis.severity.in_(["high", "critical"]),
        )
    ) or 0
    phishing_attempts = db.scalar(
        select(func.count()).select_from(PhishingAnalysis).where(
            PhishingAnalysis.user_id == user_id,
            PhishingAnalysis.verdict.in_(["phishing", "malicious", "suspicious"]),
        )
    ) or 0
    avg_score = db.scalar(
        select(func.avg(ThreatAnalysis.score)).where(ThreatAnalysis.user_id == user_id)
    ) or 0.0

    # threats per day, last 7 days
    since = datetime.now(timezone.utc) - timedelta(days=7)
    rows = db.execute(
        select(ThreatAnalysis.created_at, ThreatAnalysis.severity)
        .where(ThreatAnalysis.user_id == user_id, ThreatAnalysis.created_at >= since)
    ).all()
    per_day: dict[str, int] = {}
    for ts, _sev in rows:
        key = ts.strftime("%Y-%m-%d")
        per_day[key] = per_day.get(key, 0) + 1
    # ensure 7 keys present
    by_day = []
    for i in range(6, -1, -1):
        d = (datetime.now(timezone.utc) - timedelta(days=i)).strftime("%Y-%m-%d")
        by_day.append({"day": d, "count": per_day.get(d, 0)})

    severity_counts = Counter(s for _, s in rows)
    severity_breakdown = [
        {"severity": s, "count": severity_counts.get(s, 0)}
        for s in ("low", "medium", "high", "critical")
    ]

    attack_rows = db.execute(
        select(AttackReport.attack_type, func.count())
        .where(AttackReport.user_id == user_id)
        .group_by(AttackReport.attack_type)
        .order_by(func.count().desc())
        .limit(6)
    ).all()
    top_attack_types = [{"type": t or "other", "count": c} for t, c in attack_rows]

    recent_threats = db.scalars(
        select(ThreatAnalysis)
        .where(ThreatAnalysis.user_id == user_id)
        .order_by(desc(ThreatAnalysis.created_at))
        .limit(8)
    ).all()
    recent_activity = [
        {
            "id": t.id,
            "summary": t.summary,
            "severity": t.severity,
            "score": t.score,
            "created_at": t.created_at.isoformat(),
            "kind": "threat",
        }
        for t in recent_threats
    ]

    return {
        "total_threats": int(threats_total),
        "critical_threats": int(critical_total),
        "blocked_ips": int(blocked_ips),
        "open_incidents": int(open_incidents),
        "malware_alerts": int(malware_alerts),
        "phishing_attempts": int(phishing_attempts),
        "avg_risk_score": round(float(avg_score), 1),
        "threats_by_day": by_day,
        "severity_breakdown": severity_breakdown,
        "top_attack_types": top_attack_types,
        "recent_activity": recent_activity,
    }
