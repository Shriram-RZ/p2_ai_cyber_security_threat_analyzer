"""Threat / log analysis routes + PDF report download."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from io import BytesIO

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import User, UploadedLog, ThreatAnalysis, AttackReport, Notification, SuspiciousIp
from app.schemas.threat import LogUploadRequest, LogOut, ThreatAnalysisOut
from app.services.threat_engine import analyze_log
from app.services.pdf_report import build_threat_report_pdf
from app.utils.parsing import extract_iocs

router = APIRouter(prefix="/threats", tags=["threats"])


@router.post("/logs", response_model=LogOut)
def upload_log(
    payload: LogUploadRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = UploadedLog(
        user_id=user.id,
        filename=payload.filename or "paste.log",
        log_type=payload.log_type,
        size_bytes=len(payload.content.encode("utf-8")),
        content=payload.content,
        status="uploaded",
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return LogOut.model_validate(log)


@router.get("/logs", response_model=list[LogOut])
def list_logs(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.scalars(
        select(UploadedLog).where(UploadedLog.user_id == user.id).order_by(desc(UploadedLog.created_at)).limit(50)
    ).all()
    return [LogOut.model_validate(r) for r in rows]


@router.post("/logs/{log_id}/analyze", response_model=ThreatAnalysisOut)
async def analyze_log_route(
    log_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = db.get(UploadedLog, log_id)
    if not log or log.user_id != user.id:
        raise HTTPException(404, "Log not found")

    data = await analyze_log(log.content, log.log_type)

    record = ThreatAnalysis(
        user_id=user.id,
        log_id=log.id,
        summary=data.get("summary", ""),
        threats=data.get("threats", []),
        severity=data.get("severity", "medium"),
        score=float(data.get("score", 0.0)),
        recommendations=data.get("recommendations", []),
        raw_response=data,
    )
    db.add(record)

    log.status = "analyzed"
    db.add(log)

    # side effects: notification + suspicious ip tracking
    if data.get("severity") in ("high", "critical"):
        db.add(
            Notification(
                user_id=user.id,
                title=f"{data['severity'].upper()} threat detected in {log.filename}",
                body=data.get("summary", "")[:300],
                severity=data["severity"],
            )
        )

    iocs = extract_iocs(log.content)
    for ip in iocs["ips"][:5]:
        existing = db.scalar(
            select(SuspiciousIp).where(SuspiciousIp.user_id == user.id, SuspiciousIp.ip_address == ip)
        )
        if existing:
            existing.occurrences += 1
            db.add(existing)
        else:
            db.add(
                SuspiciousIp(
                    user_id=user.id,
                    ip_address=ip,
                    threat_type=(data.get("threats") or [{}])[0].get("type", "unknown"),
                    severity=data.get("severity", "medium"),
                )
            )

    for t in (data.get("threats") or [])[:5]:
        db.add(
            AttackReport(
                user_id=user.id,
                title=t.get("title", "Detected threat"),
                attack_type=t.get("type", "other"),
                source_ip=t.get("source_ip"),
                target=log.filename,
                severity=t.get("severity", data.get("severity", "medium")),
                description=t.get("description", ""),
                indicators=t.get("indicators", []),
            )
        )

    db.commit()
    db.refresh(record)
    return ThreatAnalysisOut.model_validate(record)


@router.post("/analyze", response_model=ThreatAnalysisOut)
async def analyze_inline(
    payload: LogUploadRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """One-shot: upload + analyze in a single call."""
    log = UploadedLog(
        user_id=user.id,
        filename=payload.filename or "paste.log",
        log_type=payload.log_type,
        size_bytes=len(payload.content.encode("utf-8")),
        content=payload.content,
        status="analyzing",
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return await analyze_log_route(log.id, user=user, db=db)


@router.get("/analyses", response_model=list[ThreatAnalysisOut])
def list_analyses(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.scalars(
        select(ThreatAnalysis)
        .where(ThreatAnalysis.user_id == user.id)
        .order_by(desc(ThreatAnalysis.created_at))
        .limit(50)
    ).all()
    return [ThreatAnalysisOut.model_validate(r) for r in rows]


@router.get("/analyses/{analysis_id}", response_model=ThreatAnalysisOut)
def get_analysis(
    analysis_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.get(ThreatAnalysis, analysis_id)
    if not row or row.user_id != user.id:
        raise HTTPException(404, "Not found")
    return ThreatAnalysisOut.model_validate(row)


@router.get("/analyses/{analysis_id}/report.pdf")
def download_report(
    analysis_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.get(ThreatAnalysis, analysis_id)
    if not row or row.user_id != user.id:
        raise HTTPException(404, "Not found")
    pdf_bytes = build_threat_report_pdf(
        user_name=user.full_name,
        analysis={
            "summary": row.summary,
            "severity": row.severity,
            "score": row.score,
            "threats": row.threats,
            "recommendations": row.recommendations,
            "attack_chain": (row.raw_response or {}).get("attack_chain", []),
            "mitre_tactics": (row.raw_response or {}).get("mitre_tactics", []),
        },
    )
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="threat-report-{row.id}.pdf"'},
    )
