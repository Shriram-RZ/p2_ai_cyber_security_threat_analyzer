"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Plus, Sparkles, User as UserIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { cn, shortId, timeAgo } from "@/lib/utils";
import type { ChatMessage } from "@/types/api";

const SUGGESTIONS = [
  "Explain CVE-2024-3400 in plain language",
  "We're seeing many failed SSH logins from 198.51.100.42 — what should we do?",
  "Walk me through containment for a ransomware infection on a Windows endpoint",
  "What MITRE ATT&CK tactics are mapped to credential dumping?",
];

export default function ChatPage() {
  const [sessions, setSessions] = useState<{ session_id: string; last_active: string }[]>([]);
  const [activeSession, setActiveSession] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshSessions().then((list) => {
      if (list.length) {
        setActiveSession(list[0].session_id);
      } else {
        setActiveSession(shortId("chat"));
      }
    });
  }, []);

  useEffect(() => {
    if (!activeSession) return;
    setLoadingMsgs(true);
    api
      .chatMessages(activeSession)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false));
  }, [activeSession]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function refreshSessions() {
    try {
      const list = await api.chatSessions();
      setSessions(list);
      return list;
    } catch {
      return [];
    }
  }

  async function send(text?: string) {
    const msg = (text ?? draft).trim();
    if (!msg) return;
    setSending(true);
    const tempId = -Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        session_id: activeSession,
        role: "user",
        content: msg,
        created_at: new Date().toISOString(),
      },
    ]);
    setDraft("");
    try {
      const r = await api.chatSend(activeSession, msg);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        r.user_message,
        r.assistant_message,
      ]);
      refreshSessions();
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast.error("Co-pilot failed to respond.");
    } finally {
      setSending(false);
    }
  }

  function newSession() {
    const id = shortId("chat");
    setActiveSession(id);
    setMessages([]);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Bot}
        title="AI SOC Co-pilot"
        subtitle="Chat with CyberSentinel. Threats, CVEs, attacker TTPs, log triage — explained instantly."
        action={
          <Button variant="ghost" icon={<Plus className="w-4 h-4" />} onClick={newSession}>
            New chat
          </Button>
        }
      />

      <div className="grid lg:grid-cols-[260px_1fr] gap-4">
        <Card padded={false} className="h-[calc(100vh-220px)] flex flex-col">
          <div className="px-4 py-3 border-b border-white/5">
            <div className="text-[11px] uppercase font-mono tracking-[0.2em] text-slate-400">
              Sessions
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-500 px-2 py-4">
                Start chatting to create a session.
              </p>
            ) : (
              sessions.map((s) => (
                <button
                  key={s.session_id}
                  onClick={() => setActiveSession(s.session_id)}
                  className={cn(
                    "w-full text-left p-2 rounded-lg flex items-start gap-2 hover:bg-white/5 transition",
                    activeSession === s.session_id && "bg-cyber-cyan/10",
                  )}
                >
                  <Sparkles
                    className={cn(
                      "w-3.5 h-3.5 mt-0.5",
                      activeSession === s.session_id ? "text-cyber-cyan" : "text-slate-500",
                    )}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-mono text-slate-200 truncate">
                      {s.session_id}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {timeAgo(s.last_active)}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        <Card padded={false} className="h-[calc(100vh-220px)] flex flex-col">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center w-7 h-7 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
                <Bot className="w-4 h-4" />
              </span>
              <div>
                <div className="text-sm font-semibold">CyberSentinel</div>
                <div className="text-[10px] uppercase font-mono tracking-[0.18em] text-slate-500">
                  Powered by Gemini Flash
                </div>
              </div>
            </div>
            <div className="text-[10px] font-mono text-emerald-300">● live</div>
          </div>

          <div ref={scroller} className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingMsgs ? (
              <Skeleton className="h-24" />
            ) : messages.length === 0 ? (
              <EmptyState onPick={send} />
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <Message key={m.id} message={m} />
                ))}
              </AnimatePresence>
            )}
            {sending && (
              <div className="flex items-start gap-3">
                <span className="grid place-items-center w-7 h-7 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan shrink-0">
                  <Bot className="w-4 h-4" />
                </span>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-2 h-2 rounded-full bg-cyber-cyan"
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/5 p-3 flex items-end gap-2">
            <textarea
              className="textarea min-h-[48px] max-h-[160px] resize-none"
              placeholder="Ask Sentinel anything cyber-related…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <Button onClick={() => send()} loading={sending} icon={<Send className="w-4 h-4" />}>
              Send
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Message({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}
    >
      <span
        className={cn(
          "grid place-items-center w-7 h-7 rounded-lg shrink-0 border",
          isUser
            ? "bg-cyber-violet/15 border-cyber-violet/30 text-cyber-violet"
            : "bg-cyber-cyan/10 border-cyber-cyan/30 text-cyber-cyan",
        )}
      >
        {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </span>
      <div
        className={cn(
          "rounded-2xl px-4 py-3 max-w-[78%]",
          isUser
            ? "bg-cyber-violet/15 border border-cyber-violet/25 text-slate-100"
            : "panel",
        )}
      >
        {isUser ? (
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        ) : (
          <div className="markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState({ onPick }: { onPick: (msg: string) => void }) {
  return (
    <div className="h-full grid place-items-center text-center px-6">
      <div className="max-w-md">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyber-cyan/30 bg-cyber-cyan/5 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-cyber-cyan">
          <Sparkles className="w-3.5 h-3.5" /> CyberSentinel
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-white">
          What are we defending today?
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Ask about CVEs, attacker tradecraft, log triage, or paste a payload to
          get an AI-grade explanation.
        </p>
        <div className="mt-6 grid sm:grid-cols-2 gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onPick(s)}
              className="text-left text-xs text-slate-300 hover:text-white rounded-xl border border-white/10 hover:border-cyber-cyan/40 bg-ink-900/60 px-3 py-2.5 transition"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
