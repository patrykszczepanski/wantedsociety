"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  MailOpen,
  Link as LinkIcon,
  Archive,
  ArrowLeft,
  Send,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APPLICATION_TYPES } from "@/lib/constants";
import type { InboundEmail, EmailStatus } from "@/lib/types";

function getApplicationLabel(email: InboundEmail): string {
  if (!email.applications) return "Powiązane zgłoszenie";
  const typeLabel = APPLICATION_TYPES[email.applications.type] || email.applications.type;
  const data = email.applications.data as unknown as Record<string, unknown>;
  const name = data?.car_name || data?.company_name || data?.instagram_handle || "";
  const edition = email.applications.event_editions;
  const editionLabel = edition ? `${edition.name}` : "";
  if (name && editionLabel) return `${typeLabel} — ${name} (${editionLabel})`;
  if (name) return `${typeLabel} — ${name}`;
  if (editionLabel) return `${typeLabel} — ${editionLabel}`;
  return typeLabel;
}

const STATUS_LABELS: Record<EmailStatus, string> = {
  unread: "Nieprzeczytane",
  read: "Przeczytane",
  linked: "Powiązane",
  archived: "Zarchiwizowane",
};

const STATUS_COLORS: Record<EmailStatus, string> = {
  unread: "bg-brand-red/20 text-brand-red",
  read: "bg-secondary text-muted-foreground",
  linked: "bg-green-500/20 text-green-400",
  archived: "bg-muted text-muted-foreground",
};

export default function AdminInboxPage() {
  const [emails, setEmails] = useState<InboundEmail[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedEmail, setSelectedEmail] = useState<InboundEmail | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadEmails = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString() });
    if (statusFilter) params.set("status", statusFilter);

    const res = await fetch(`/api/admin/inbox?${params}`);
    if (res.ok) {
      const data = await res.json();
      setEmails(data.emails || []);
      setTotal(data.total || 0);
    }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  async function openEmail(email: InboundEmail) {
    const res = await fetch(`/api/admin/inbox/${email.id}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedEmail(data);
      // Update in list
      setEmails((prev) =>
        prev.map((e) => (e.id === data.id ? data : e))
      );
    }
  }

  async function updateStatus(emailId: string, status: EmailStatus) {
    const res = await fetch(`/api/admin/inbox/${emailId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setEmails((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      if (selectedEmail?.id === updated.id) setSelectedEmail(updated);
    }
  }

  async function sendReply() {
    if (!selectedEmail || !replyContent.trim()) return;
    setSending(true);

    const res = await fetch(`/api/admin/inbox/${selectedEmail.id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyContent }),
    });

    if (res.ok) {
      setReplyContent("");
    }
    setSending(false);
  }

  const totalPages = Math.ceil(total / 20);

  if (selectedEmail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedEmail(null);
              setReplyContent("");
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Wróć
          </Button>
          <h1 className="font-heading text-2xl font-bold">Wiadomość</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <CardTitle className="text-lg truncate">
                  {selectedEmail.subject || "(brak tematu)"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Od: {selectedEmail.from_name ? `${selectedEmail.from_name} <${selectedEmail.from_email}>` : selectedEmail.from_email}
                </p>
                <p className="text-sm text-muted-foreground">
                  Do: {selectedEmail.to_email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(selectedEmail.created_at).toLocaleString("pl-PL")}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <span className={cn("text-xs px-2 py-1 rounded", STATUS_COLORS[selectedEmail.status])}>
                  {STATUS_LABELS[selectedEmail.status]}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedEmail.application_id && (
              <a
                href={`/admin/zgloszenia/${selectedEmail.application_id}`}
                className="inline-flex items-center gap-1 text-sm text-brand-red hover:underline"
              >
                <LinkIcon className="w-3 h-3" />
                {getApplicationLabel(selectedEmail)}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <div className="bg-secondary/50 rounded-lg p-4 whitespace-pre-wrap text-sm">
              {selectedEmail.body_text || selectedEmail.body_html || "(brak treści)"}
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              {selectedEmail.status !== "unread" && (
                <Button variant="outline" size="sm" onClick={() => updateStatus(selectedEmail.id, "unread")}>
                  <Mail className="w-3.5 h-3.5 mr-1" />
                  Oznacz jako nieprzeczytane
                </Button>
              )}
              {selectedEmail.status !== "archived" && (
                <Button variant="outline" size="sm" onClick={() => updateStatus(selectedEmail.id, "archived")}>
                  <Archive className="w-3.5 h-3.5 mr-1" />
                  Archiwizuj
                </Button>
              )}
            </div>

            {/* Reply */}
            <div className="border-t border-border pt-4 space-y-3">
              <h3 className="text-sm font-semibold">Odpowiedz</h3>
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Napisz odpowiedź..."
                rows={4}
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">
        Poczta <span className="text-brand-red">przychodząca</span>
      </h1>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={statusFilter === "" ? "default" : "outline"}
          size="sm"
          onClick={() => { setStatusFilter(""); setPage(1); }}
        >
          Wszystkie
        </Button>
        {(["unread", "read", "linked", "archived"] as EmailStatus[]).map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => { setStatusFilter(s); setPage(1); }}
          >
            {STATUS_LABELS[s]}
          </Button>
        ))}
      </div>

      {/* Email list */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Ładowanie...</p>
      ) : emails.length === 0 ? (
        <p className="text-muted-foreground text-sm">Brak wiadomości.</p>
      ) : (
        <div className="space-y-2">
          {emails.map((email) => (
            <Card
              key={email.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-secondary/50",
                email.status === "unread" && "border-brand-red/30"
              )}
              onClick={() => openEmail(email)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="shrink-0">
                  {email.status === "unread" ? (
                    <Mail className="w-5 h-5 text-brand-red" />
                  ) : (
                    <MailOpen className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm truncate", email.status === "unread" && "font-semibold")}>
                      {email.from_name || email.from_email}
                    </p>
                    {email.application_id && (
                      <a
                        href={`/admin/zgloszenia/${email.application_id}`}
                        className="inline-flex items-center gap-1 text-xs text-green-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LinkIcon className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[200px]">
                          {getApplicationLabel(email)}
                        </span>
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {email.subject || "(brak tematu)"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={cn("text-xs px-2 py-0.5 rounded", STATUS_COLORS[email.status])}>
                    {STATUS_LABELS[email.status]}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(email.created_at).toLocaleString("pl-PL")}
                  </p>
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
