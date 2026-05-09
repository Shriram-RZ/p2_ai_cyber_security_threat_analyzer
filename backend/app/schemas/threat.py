from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Any, Literal


class LogUploadRequest(BaseModel):
    filename: str = Field(default="paste.log")
    log_type: str = Field(default="generic")
    content: str = Field(min_length=1, max_length=200_000)


class LogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    filename: str
    log_type: str
    size_bytes: int
    status: str
    created_at: datetime


class ThreatAnalysisOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    log_id: int | None
    summary: str
    threats: list[Any]
    severity: str
    score: float
    recommendations: list[Any]
    created_at: datetime


class PhishingRequest(BaseModel):
    input_type: Literal["url", "email", "message"] = "url"
    input_value: str = Field(min_length=3, max_length=8000)


class PhishingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    input_type: str
    input_value: str
    risk_score: float
    verdict: str
    indicators: list[Any]
    explanation: str
    recommendation: str
    created_at: datetime


class MalwareRequest(BaseModel):
    filename: str
    content_or_indicators: str = Field(min_length=3, max_length=200_000)
    sha256: str | None = None


class MalwareOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    filename: str
    sha256: str | None
    family: str | None
    behaviors: list[Any]
    severity: str
    score: float
    summary: str
    iocs: list[Any]
    created_at: datetime


class ChatRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=80)
    message: str = Field(min_length=1, max_length=8000)


class ChatMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    session_id: str
    role: str
    content: str
    created_at: datetime


class ChatResponse(BaseModel):
    session_id: str
    user_message: ChatMessageOut
    assistant_message: ChatMessageOut


class DashboardStats(BaseModel):
    total_threats: int
    critical_threats: int
    blocked_ips: int
    open_incidents: int
    malware_alerts: int
    phishing_attempts: int
    avg_risk_score: float
    threats_by_day: list[dict[str, Any]]
    severity_breakdown: list[dict[str, Any]]
    top_attack_types: list[dict[str, Any]]
    recent_activity: list[dict[str, Any]]


class IncidentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    summary: str
    severity: str
    status: str
    created_at: datetime


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    body: str
    severity: str
    read: bool
    created_at: datetime
