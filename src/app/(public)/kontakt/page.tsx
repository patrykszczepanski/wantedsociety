"use client";

import { useState } from "react";
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INSTAGRAM_URL, FACEBOOK_URL, INSTAGRAM_HANDLE } from "@/lib/constants";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");

    const res = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });

    if (res.ok) {
      setSent(true);
    } else {
      setError("Wystąpił błąd podczas wysyłania.");
    }
    setSending(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <h1 className="font-heading text-4xl sm:text-5xl font-bold text-center mb-12">
        <span className="text-brand-red">KONTAKT</span>
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact info */}
        <div className="space-y-6">
          <h2 className="font-heading text-2xl font-bold">
            Skontaktuj się z nami
          </h2>
          <p className="text-muted-foreground">
            Masz pytania? Napisz do nas przez formularz lub social media.
          </p>

          <div className="space-y-4">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-white/80 hover:text-white transition-colors"
            >
              <Instagram className="w-5 h-5 text-brand-red" />
              <span>{INSTAGRAM_HANDLE}</span>
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-white/80 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5 text-brand-red"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Wanted Society</span>
            </a>
          </div>
        </div>

        {/* Contact form */}
        <Card>
          <CardHeader>
            <CardTitle>Formularz kontaktowy</CardTitle>
          </CardHeader>
          <CardContent>
            {sent ? (
              <p className="text-green-400 text-center py-8">
                Wiadomość wysłana! Odpowiemy najszybciej jak to możliwe.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Imię</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Twoje imię"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="twoj@email.pl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Wiadomość</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    placeholder="Twoja wiadomość..."
                  />
                </div>
                {error && <p className="text-sm text-brand-red">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-brand-red hover:bg-brand-red/90"
                  disabled={sending}
                >
                  {sending ? "Wysyłanie..." : "Wyślij wiadomość"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
