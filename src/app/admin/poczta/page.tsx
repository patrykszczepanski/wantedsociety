"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  MailOpen,
  Link as LinkIcon,
  Archive,
  ArrowLeft,
  Send,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APPLICATION_TYPES } from "@/lib/constants";
import type {
  EmailThread,
  InboundEmail,
  ApplicationType,
  ExhibitorData,
  MediaData,
  PartnerData,
} from "@/lib/types";

type ThreadFilter = "" | "unread" | "linked" | "archived";

function getApplicationLabel(app: {
  type: ApplicationType;
  data: ExhibitorData | MediaData | PartnerData;
  event_editions?: { name: string; year: number } | null;
}): string {
  const typeLabel = APPLICATION_TYPES[app.type] || app.type;
  const data = app.data as unknown as Record<string, unknown>;
  const name =
    data?.car_name || data?.company_name || data?.instagram_handle || "";
  const edition = app.event_editions;
  const editionLabel = edition ? `${edition.name}` : "";
  if (name && editionLabel) return `${typeLabel} — ${name} (${editionLabel})`;
  if (name) return `${typeLabel} — ${name}`;
  if (editionLabel) return `${typeLabel} — ${editionLabel}`;
  return typeLabel;
}

function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "teraz";
  if (diffMin < 60) return `${diffMin} min temu`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} godz. temu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} dn. temu`;
  return date.toLocaleDateString("pl-PL");
}

const FILTER_LABELS: Record<ThreadFilter, string> = {
  "": "Wszystkie",
  unread: "Nieprzeczytane",
  linked: "Powiązane",
  archived: "Zarchiwizowane",
};

export default function AdminInboxPage() {
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<ThreadFilter>("");
  const [loading, setLoading] = useState(true);

  // Thread detail state
  const [selectedThread, setSelectedThread] = useState<{
    messages: InboundEmail[];
    application: EmailThread["applications"];
  } | null>(null);
  const [selectedThreadMeta, setSelectedThreadMeta] =
    useState<EmailThread | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString() });
    if (filter) params.set("status", filter);

    const res = await fetch(`/api/admin/inbox/threads?${params}`);
    if (res.ok) {
      const data = await res.json();
      setThreads(data.threads || []);
      setTotal(data.total || 0);
    }
    setLoading(false);
  }, [page, filter]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedThread?.messages]);

  async function openThread(thread: EmailThread) {
    const res = await fetch(`/api/admin/inbox/threads/${thread.thread_id}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedThread(data);
      setSelectedThreadMeta(thread);
      // Update unread count in list
      setThreads((prev) =>
        prev.map((t) =>
          t.thread_id === thread.thread_id ? { ...t, unread_count: 0 } : t
        )
      );
    }
  }

  async function updateThreadStatus(status: "unread" | "archived") {
    if (!selectedThreadMeta) return;
    const res = await fetch(
      `/api/admin/inbox/threads/${selectedThreadMeta.thread_id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );
    if (res.ok) {
      setSelectedThread(null);
      setSelectedThreadMeta(null);
      setReplyContent("");
      loadThreads();
    }
  }

  async function sendReply() {
    if (!selectedThread || !replyContent.trim()) return;
    // Find latest inbound message to reply to (for threading headers)
    const inboundMessages = selectedThread.messages.filter(
      (m) => m.direction === "inbound"
    );
    const targetEmail =
      inboundMessages[inboundMessages.length - 1] ||
      selectedThread.messages[0];

    setSending(true);
    const res = await fetch(`/api/admin/inbox/${targetEmail.id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyContent }),
    });

    if (res.ok) {
      setReplyContent("");
      // Reload thread to show the new outbound message
      if (selectedThreadMeta) {
        const threadRes = await fetch(
          `/api/admin/inbox/threads/${selectedThreadMeta.thread_id}`
        );
        if (threadRes.ok) {
          const data = await threadRes.json();
          setSelectedThread(data);
        }
      }
    }
    setSending(false);
  }

  const totalPages = Math.ceil(total / 20);

  // Thread detail view
  if (selectedThread && selectedThreadMeta) {
    const subject = selectedThreadMeta.subject || "(brak tematu)";
    const app = selectedThread.application;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedThread(null);
              setSelectedThreadMeta(null);
              setReplyContent("");
              loadThreads();
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Wróć
          </Button>
          <h1 className="font-heading text-xl font-bold truncate">
            {subject}
          </h1>
        </div>

        {/* Thread header info */}
        <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
          <span>
            {selectedThreadMeta.participant_name ||
              selectedThreadMeta.participant_email}
          </span>
          {selectedThreadMeta.participant_name && (
            <span className="text-xs">
              &lt;{selectedThreadMeta.participant_email}&gt;
            </span>
          )}
          {app && (
            <a
              href={`/admin/zgloszenia/${app.id}`}
              className="inline-flex items-center gap-1 text-xs text-green-400 hover:underline"
            >
              <LinkIcon className="w-3 h-3" />
              {getApplicationLabel(app)}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <span className="text-xs">
            {selectedThread.messages.length} wiadomości
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateThreadStatus("unread")}
          >
            <Mail className="w-3.5 h-3.5 mr-1" />
            Oznacz jako nieprzeczytane
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateThreadStatus("archived")}
          >
            <Archive className="w-3.5 h-3.5 mr-1" />
            Archiwizuj
          </Button>
        </div>

        {/* Messages */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {selectedThread.messages.map((msg) => {
            const isOutbound = msg.direction === "outbound";
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  isOutbound ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-lg px-4 py-3 space-y-1",
                    isOutbound ? "bg-brand-red/20" : "bg-secondary"
                  )}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">
                      {isOutbound
                        ? "Wanted Society"
                        : msg.from_name || msg.from_email}
                    </span>
                    <span>
                      {new Date(msg.created_at).toLocaleString("pl-PL")}
                    </span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">
                    {msg.body_text || "(brak treści)"}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply */}
        <div className="border-t border-border pt-4 space-y-3">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Napisz odpowiedź..."
            rows={3}
          />
          <Button
            onClick={sendReply}
            disabled={sending || !replyContent.trim()}
            className="bg-brand-red hover:bg-brand-red/90"
          >
            <Send className="w-4 h-4 mr-1" />
            {sending ? "Wysyłanie..." : "Wyślij"}
          </Button>
        </div>
      </div>
    );
  }

  // Thread list view
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">
        Poczta <span className="text-brand-red">przychodząca</span>
      </h1>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["", "unread", "linked", "archived"] as ThreadFilter[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
          >
            {FILTER_LABELS[f]}
          </Button>
        ))}
      </div>

      {/* Thread list */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Ładowanie...</p>
      ) : threads.length === 0 ? (
        <p className="text-muted-foreground text-sm">Brak wątków.</p>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => (
            <Card
              key={thread.thread_id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-secondary/50",
                thread.unread_count > 0 && "border-brand-red/30"
              )}
              onClick={() => openThread(thread)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="shrink-0">
                  {thread.unread_count > 0 ? (
                    <Mail className="w-5 h-5 text-brand-red" />
                  ) : (
                    <MailOpen className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-sm truncate",
                        thread.unread_count > 0 && "font-semibold"
                      )}
                    >
                      {thread.participant_name || thread.participant_email}
                    </p>
                    {thread.unread_count > 0 && (
                      <span className="bg-brand-red text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                        {thread.unread_count}
                      </span>
                    )}
                    {thread.applications && (
                      <a
                        href={`/admin/zgloszenia/${thread.applications.id}`}
                        className="inline-flex items-center gap-1 text-xs text-green-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LinkIcon className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[200px]">
                          {getApplicationLabel(thread.applications)}
                        </span>
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {thread.subject || "(brak tematu)"}
                  </p>
                  {thread.last_message_preview && (
                    <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                      {thread.last_message_preview}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {relativeTime(thread.last_message_at)}
                  </p>
                  {thread.message_count > 1 && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="w-3 h-3" />
                      {thread.message_count}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Poprzednia
          </Button>
          <span className="text-sm text-muted-foreground self-center">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Następna
          </Button>
        </div>
      )}
    </div>
  );
}
