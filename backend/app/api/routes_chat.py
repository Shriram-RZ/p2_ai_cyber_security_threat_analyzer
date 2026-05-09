from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, asc

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import User, AiChatHistory
from app.schemas.threat import ChatRequest, ChatResponse, ChatMessageOut
from app.services.threat_engine import chat_reply

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/send", response_model=ChatResponse)
async def send(
    payload: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    history_rows = db.scalars(
        select(AiChatHistory)
        .where(AiChatHistory.user_id == user.id, AiChatHistory.session_id == payload.session_id)
        .order_by(asc(AiChatHistory.created_at))
        .limit(40)
    ).all()
    history = [{"role": r.role, "content": r.content} for r in history_rows]
    history.append({"role": "user", "content": payload.message})

    answer = await chat_reply(history)

    user_msg = AiChatHistory(
        user_id=user.id, session_id=payload.session_id, role="user", content=payload.message
    )
    asst_msg = AiChatHistory(
        user_id=user.id, session_id=payload.session_id, role="assistant", content=answer
    )
    db.add_all([user_msg, asst_msg])
    db.commit()
    db.refresh(user_msg)
    db.refresh(asst_msg)
    return ChatResponse(
        session_id=payload.session_id,
        user_message=ChatMessageOut.model_validate(user_msg),
        assistant_message=ChatMessageOut.model_validate(asst_msg),
    )


@router.get("/sessions")
def list_sessions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(
        select(AiChatHistory.session_id, AiChatHistory.created_at)
        .where(AiChatHistory.user_id == user.id)
        .order_by(AiChatHistory.created_at.desc())
    ).all()
    seen, out = set(), []
    for sid, ts in rows:
        if sid in seen:
            continue
        seen.add(sid)
        out.append({"session_id": sid, "last_active": ts.isoformat()})
        if len(out) >= 30:
            break
    return out


@router.get("/sessions/{session_id}", response_model=list[ChatMessageOut])
def session_messages(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.scalars(
        select(AiChatHistory)
        .where(AiChatHistory.user_id == user.id, AiChatHistory.session_id == session_id)
        .order_by(asc(AiChatHistory.created_at))
    ).all()
    return [ChatMessageOut.model_validate(r) for r in rows]
