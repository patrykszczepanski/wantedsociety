"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Hasło musi mieć minimum 6 znaków.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Nie udało się utworzyć konta.");
      setLoading(false);
      return;
    }

    window.location.href = "/";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-heading text-center">
          Rejestracja
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Imię i nazwisko</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Jan Kowalski"
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
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimum 6 znaków"
            />
          </div>
          {error && <p className="text-sm text-brand-red">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Rejestracja..." : "Zarejestruj się"}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-4">
          Masz już konto?{" "}
          <Link href="/logowanie" className="text-brand-red hover:underline">
            Zaloguj się
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
