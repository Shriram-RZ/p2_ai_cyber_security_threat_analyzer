"use client";
import type {
  AuthResponse,
  ChatMessage,
  ChatResponse,
  CVEResult,
  DashboardStats,
  Incident,
  MalwareAnalysis,
  Notification,
  PhishingAnalysis,
  SuspiciousIP,
  ThreatAnalysis,
  UploadedLog,
  User,
  AttackEntry,
} from "@/types/api";

const BASE = "/api"; // proxied to backend by next.config rewrites

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown = null) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(opts.headers || {}),
    },
    ...opts,
  });
  if (!res.ok) {
    let detail: any = null;
    try {
      detail = await res.json();
    } catch {
      // ignore
    }
    throw new ApiError(detail?.detail || res.statusText, res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  // auth
  signup: (body: { email: string; password: string; full_name: string }) =>
    request<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),
  me: () => request<User>("/auth/me"),
  forgotPassword: (email: string) =>
    request<{ message: string; reset_token: string | null }>(
      "/auth/forgot-password",
      { method: "POST", body: JSON.stringify({ email }) },
    ),
  resetPassword: (token: string, new_password: string) =>
    request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password }),
    }),

  // dashboard
  dashboard: () => request<DashboardStats>("/dashboard/overview"),

  // threats / logs
  uploadLog: (body: { filename?: string; log_type?: string; content: string }) =>
    request<UploadedLog>("/threats/logs", { method: "POST", body: JSON.stringify(body) }),
  listLogs: () => request<UploadedLog[]>("/threats/logs"),
  analyzeLog: (id: number) =>
    request<ThreatAnalysis>(`/threats/logs/${id}/analyze`, { method: "POST" }),
  analyzeInline: (body: { filename?: string; log_type?: string; content: string }) =>
    request<ThreatAnalysis>("/threats/analyze", { method: "POST", body: JSON.stringify(body) }),
  listAnalyses: () => request<ThreatAnalysis[]>("/threats/analyses"),
  getAnalysis: (id: number) => request<ThreatAnalysis>(`/threats/analyses/${id}`),
  reportPdfUrl: (id: number) => `${BASE}/threats/analyses/${id}/report.pdf`,

  // phishing
  scanPhishing: (input_type: "url" | "email" | "message", input_value: string) =>
    request<PhishingAnalysis>("/phishing/scan", {
      method: "POST",
      body: JSON.stringify({ input_type, input_value }),
    }),
  phishingHistory: () => request<PhishingAnalysis[]>("/phishing/history"),

  // malware
  scanMalware: (filename: string, content_or_indicators: string, sha256?: string) =>
    request<MalwareAnalysis>("/malware/scan", {
      method: "POST",
      body: JSON.stringify({ filename, content_or_indicators, sha256 }),
    }),
  malwareHistory: () => request<MalwareAnalysis[]>("/malware/history"),

  // chat
  chatSend: (session_id: string, message: string) =>
    request<ChatResponse>("/chat/send", {
      method: "POST",
      body: JSON.stringify({ session_id, message }),
    }),
  chatSessions: () => request<{ session_id: string; last_active: string }[]>("/chat/sessions"),
  chatMessages: (sid: string) => request<ChatMessage[]>(`/chat/sessions/${sid}`),

  // intel
  ips: () => request<SuspiciousIP[]>("/ips"),
  blockIp: (id: number) => request(`/ips/${id}/block`, { method: "POST" }),
  unblockIp: (id: number) => request(`/ips/${id}/unblock`, { method: "POST" }),
  notifications: () => request<Notification[]>("/notifications"),
  markRead: (id: number) => request(`/notifications/${id}/read`, { method: "POST" }),
  markAllRead: () => request("/notifications/read-all", { method: "POST" }),
  attacks: () => request<AttackEntry[]>("/attacks"),
  incidents: () => request<Incident[]>("/incidents"),
  createIncident: (body: any) =>
    request<{ id: number }>("/incidents", { method: "POST", body: JSON.stringify(body) }),
  intelFeed: () =>
    request<{ global_alerts: any[]; tenant_summary: any }>("/intel/feed"),
  cveSearch: (q: string) =>
    request<{ query: string; results: CVEResult[] }>(`/cve/search?q=${encodeURIComponent(q)}`),
};
