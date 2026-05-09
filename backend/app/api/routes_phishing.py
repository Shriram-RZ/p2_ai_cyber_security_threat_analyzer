from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import User, PhishingAnalysis
from app.schemas.threat import PhishingRequest, PhishingOut
from app.services.threat_engine import analyze_phishing

router = APIRouter(prefix="/phishing", tags=["phishing"])


@router.post("/scan", response_model=PhishingOut)
async def scan(
    payload: PhishingRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = await analyze_phishing(payload.input_type, payload.input_value)
    record = PhishingAnalysis(
        user_id=user.id,
        input_type=payload.input_type,
        input_value=payload.input_value,
        verdict=data["verdict"],
        risk_score=float(data["risk_score"]),
        indicators=data.get("indicators", []),
        explanation=data.get("explanation", ""),
        recommendation=data.get("recommendation", ""),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return PhishingOut.model_validate(record)


@router.get("/history", response_model=list[PhishingOut])
def history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.scalars(
        select(PhishingAnalysis)
        .where(PhishingAnalysis.user_id == user.id)
        .order_by(desc(PhishingAnalysis.created_at))
        .limit(50)
    ).all()
    return [PhishingOut.model_validate(r) for r in rows]


@router.get("/{rid}", response_model=PhishingOut)
def detail(rid: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = db.get(PhishingAnalysis, rid)
    if not row or row.user_id != user.id:
        raise HTTPException(404, "Not found")
    return PhishingOut.model_validate(row)
