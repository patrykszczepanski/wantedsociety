"use client";

import { useEffect, useState, useRef } from "react";
import { getRealtimeClient } from "@/lib/supabase/realtime";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import type { ApplicationMessage } from "@/lib/types";

interface ConversationThreadProps {
  applicationId: string;
  currentUserId: string;
  isAdmin?: boolean;
}

export function ConversationThread({
  applicationId,
  currentUserId,
  isAdmin = false,
}: ConversationThreadProps) {
  const [messages, setMessages] = useState<ApplicationMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadMessages() {
      const res = await fetch(`/api/applications/${applicationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => {
          const incoming = data || [];
          if (
            prev.length === incoming.length &&
            prev[prev.length - 1]?.id === incoming[incoming.length - 1]?.id
          ) {
            return prev;
          }
          return incoming;
        });
      }
    }

    loadMessages();

    const interval = setInterval(loadMessages, 3000);

    const supabase = getRealtimeClient();
    const channel = supabase
      .channel(`messages-${applicationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "application_messages",
          filter: `application_id=eq.${applicationId}`,
        },
        (payload) => {
          const newMsg = payload.new as ApplicationMessage;
          setMessages((prev) =>
            prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
          );
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [applicationId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function sendMessage() {
    if (!newMessage.trim()) return;
    setSending(true);

    const res = await fetch(`/api/applications/${applicationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newMessage, is_admin: isAdmin }),
    });

    if (res.ok) {
      const sentMessage = await res.json();
      setMessages((prev) =>
        prev.some((m) => m.id === sentMessage.id) ? prev : [...prev, sentMessage]
      );
      setNewMessage("");
    }
    setSending(false);
  }

  return (
    <div className="flex flex-col h-[400px]">
      <div ref={containerRef} className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">
            Brak wiadomości. Rozpocznij konwersację.
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender_id === currentUserId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-4 py-2 ${
                msg.sender_id === currentUserId
                  ? "bg-brand-red/20 text-white"
                  : "bg-secondary text-white"
              }`}
            >
              {msg.sender_id !== currentUserId && (
                <p className="text-xs font-semibold mb-0.5">
                  {msg.is_admin ? "Administrator" : msg.sender_name}
                </p>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(msg.created_at).toLocaleString("pl-PL")}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-3 flex gap-2">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Napisz wiadomość..."
          rows={1}
          className="resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <Button
          onClick={sendMessage}
          disabled={sending || !newMessage.trim()}
          size="icon"
          className="bg-brand-red hover:bg-brand-red/90 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
