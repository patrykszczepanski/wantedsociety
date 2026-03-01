"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { EventEdition } from "@/lib/types";

export default function AdminEditionEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [edition, setEdition] = useState<EventEdition | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDateDisplay, setEventDateDisplay] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [instagramEmbedUrl, setInstagramEmbedUrl] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/editions/${id}`);
      if (res.ok) {
        const data: EventEdition = await res.json();
        setEdition(data);
        setName(data.name);
        setYear(data.year.toString());
        setEventDate(data.event_date ?? "");
        setEventDateDisplay(data.event_date_display ?? "");
        setLocation(data.location ?? "");
        setDescription(data.description ?? "");
        setInstagramEmbedUrl(data.instagram_embed_url ?? "");
      }
    }
    load();
  }, [id]);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/editions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        year: parseInt(year),
        event_date: eventDate || null,
        event_date_display: eventDateDisplay || null,
        location: location || null,
        description: description || null,
        instagram_embed_url: instagramEmbedUrl || null,
      }),
    });

    if (res.ok) {
      toast.success("Edycja zaktualizowana");
      const data = await res.json();
      setEdition(data);
    } else {
      const data = await res.json();
      toast.error(data.error || "Błąd zapisu");
    }
    setSaving(false);
  }

  if (!edition) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        &larr; Wróć
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            Edytuj edycję: {edition.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nazwa *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Rok *</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_date">Data eventu (ISO)</Label>
            <Input
              id="event_date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_date_display">Data (wyświetlana)</Label>
            <Input
              id="event_date_display"
              value={eventDateDisplay}
              onChange={(e) => setEventDateDisplay(e.target.value)}
              placeholder="np. 22 czerwca 2026"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Lokalizacja</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram_embed_url">Instagram embed URL</Label>
            <Input
              id="instagram_embed_url"
              value={instagramEmbedUrl}
              onChange={(e) => setInstagramEmbedUrl(e.target.value)}
            />
          </div>
          <Button
            onClick={save}
            disabled={saving || !name || !year}
            className="bg-brand-red hover:bg-brand-red/90"
          >
            {saving ? "Zapisywanie..." : "Zapisz zmiany"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
