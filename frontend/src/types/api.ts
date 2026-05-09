export type Severity = "low" | "medium" | "high" | "critical";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

export interface UploadedLog {
  id: number;
  filename: string;
  log_type: string;
  size_bytes: number;
  status: string;
  created_at: string;
}

export interface ThreatItem {
  type: string;
  title: string;
  description: string;
  severity: Severity;
  indicators: string[];
  source_ip: string | null;
  confidence: number;
}

export interface ThreatAnalysis {
  id: number;
  log_id: number | null;
  summary: string;
  threats: ThreatItem[];
  severity: Severity;
  score: number;
  recommendations: string[];
  created_at: string;
}

export interface PhishingAnalysis {
  id: number;
  input_type: "url" | "email" | "message";
  input_value: string;
  risk_score: number;
  verdict: "safe" | "suspicious" | "phishing" | "malicious" | string;
  indicators: { label: string; detail: string }[];
  explanation: string;
  recommendation: string;
  created_at: string;
}

export interface MalwareAnalysis {
  id: number;
  filename: string;
  sha256: string | null;
  family: string | null;
  behaviors: { name: string; description: string; severity: Severity }[];
  severity: Severity;
  score: number;
  summary: string;
  iocs: { type: string; value: string }[];
  created_at: string;
}

export interface ChatMessage {
  id: number;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface ChatResponse {
  session_id: string;
  user_message: ChatMessage;
  assistant_message: ChatMessage;
}

export interface DashboardStats {
  total_threats: number;
  critical_threats: number;
  blocked_ips: number;
  open_incidents: number;
  malware_alerts: number;
  phishing_attempts: number;
  avg_risk_score: number;
  threats_by_day: { day: string; count: number }[];
  severity_breakdown: { severity: Severity; count: number }[];
  top_attack_types: { type: string; count: number }[];
  recent_activity: {
    id: number;
    summary: string;
    severity: Severity;
    score: number;
    created_at: string;
    kind: string;
  }[];
}

export interface SuspiciousIP {
  id: number;
  ip_address: string;
  country: string | null;
  threat_type: string;
  severity: Severity;
  occurrences: number;
  blocked: boolean;
  last_seen: string;
}

export interface AttackEntry {
  id: number;
  title: string;
  attack_type: string;
  source_ip: string | null;
  target: string | null;
  severity: Severity;
  description: string;
  indicators: string[];
  created_at: string;
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  severity: string;
  read: boolean;
  created_at: string;
}

export interface Incident {
  id: number;
  title: string;
  summary: string;
  severity: Severity;
  status: string;
  created_at: string;
}

export interface CVEResult {
  id: string;
  published: string;
  lastModified: string;
  cvss: number | null;
  description: string;
}
