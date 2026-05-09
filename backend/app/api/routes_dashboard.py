from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.threat import DashboardStats
from app.services.dashboard_service import get_overview

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/overview", response_model=DashboardStats)
def overview(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_overview(db, user.id)
