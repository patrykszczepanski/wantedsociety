"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getRealtimeClient } from "@/lib/supabase/realtime";
import { getPublicStorageUrl } from "@/lib/supabase/storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mail, ImagePlus, X, Loader2 } from "lucide-react";
import { ChatImageLightbox } from "./chat-image-lightbox";
import type { ApplicationMessage } from "@/lib/types";

interface ConversationThreadProps {
  applicationId: string;
  currentUserId: string;
  isAdmin?: boolean;
}

const MAX_PHOTOS = 5;

export function ConversationThread({
  applicationId,
  currentUserId,
  isAdmin = false,
}: ConversationThreadProps) {
  const [messages, setMessages] = useState<ApplicationMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingPhotos, setPendingPhotos] = useState<{ path: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const getPhotoUrl = useCallback((path: string) => {
    return getPublicStorageUrl("application-photos", path);
  }, []);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = MAX_PHOTOS - pendingPhotos.length;
    const toUpload = Array.from(files).slice(0, remaining);

    if (toUpload.length === 0) return;

    setUploading(true);
    try {
      const uploaded: { path: string; url: string }[] = [];
      for (const file of toUpload) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/applications/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const { path } = await res.json();
          uploaded.push({ path, url: getPhotoUrl(path) });
        }
      }
      setPendingPhotos((prev) => [...prev, ...uploaded]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removePendingPhoto(index: number) {
    setPendingPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function sendMessage() {
    const hasText = newMessage.trim().length > 0;
    const hasPhotos = pendingPhotos.length > 0;
    if (!hasText && !hasPhotos) return;

    setSending(true);

    const res = await fetch(`/api/applications/${applicationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: newMessage,
        is_admin: isAdmin,
        photo_paths: pendingPhotos.map((p) => p.path),
      }),
    });

    if (res.ok) {
      const sentMessage = await res.json();
      setMessages((prev) =>
        prev.some((m) => m.id === sentMessage.id) ? prev : [...prev, sentMessage]
      );
      setNewMessage("");
      setPendingPhotos([]);
    }
    setSending(false);
  }

  function openLightbox(photoPaths: string[], index: number) {
    setLightbox({
      images: photoPaths.map(getPhotoUrl),
      index,
    });
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
              {msg.content && (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}
              {msg.photo_paths && msg.photo_paths.length > 0 && (
                <div
                  className={`mt-2 gap-1.5 ${
                    msg.photo_paths.length === 1
                      ? "flex"
                      : "grid grid-cols-2"
                  }`}
                >
                  {msg.photo_paths.map((path, i) => (
                    <button
                      key={path}
                      type="button"
                      className="relative rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openLightbox(msg.photo_paths!, i)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getPhotoUrl(path)}
                        alt={`Załącznik ${i + 1}`}
                        className="w-full h-auto max-h-48 object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1.5 mt-1">
                <p className="text-xs text-muted-foreground">
                  {new Date(msg.created_at).toLocaleString("pl-PL")}
                </p>
                {msg.source === "email" && (
                  <Mail className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {pendingPhotos.length > 0 && (
        <div className="border-t border-border px-3 pt-2 flex gap-2 overflow-x-auto">
          {pendingPhotos.map((photo, i) => (
            <div key={photo.path} className="relative shrink-0 w-16 h-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={`Pending ${i + 1}`}
                className="w-16 h-16 object-cover rounded"
              />
              <button
                type="button"
                className="absolute -top-1 -right-1 bg-black/70 rounded-full p-0.5"
                onClick={() => removePendingPhoto(i)}
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-border p-3 flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-white"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || pendingPhotos.length >= MAX_PHOTOS}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImagePlus className="w-4 h-4" />
          )}
        </Button>
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
          disabled={sending || (!newMessage.trim() && pendingPhotos.length === 0)}
          size="icon"
          className="bg-brand-red hover:bg-brand-red/90 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {lightbox && (
        <ChatImageLightbox
          images={lightbox.images}
          currentIndex={lightbox.index}
          onClose={() => setLightbox(null)}
          onNavigate={(index) => setLightbox((prev) => prev ? { ...prev, index } : null)}
        />
      )}
    </div>
  );
}
