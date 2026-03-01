"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { EventEdition } from "@/lib/types";

interface EditionWithCount extends EventEdition {
  applications: [{ count: number }];
}

export default function AdminEditionsPage() {
  const [editions, setEditions] = useState<EditionWithCount[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // New edition form
  const [name, setName] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [eventDate, setEventDate] = useState("");
  const [eventDateDisplay, setEventDateDisplay] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [instagramEmbedUrl, setInstagramEmbedUrl] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadEditions();
  }, []);

  async function loadEditions() {
    const res = await fetch("/api/admin/editions");
    if (res.ok) {
      const data = await res.json();
      setEditions(data ?? []);
    }
  }

  async function createEdition() {
    setCreating(true);
    const res = await fetch("/api/admin/editions", {
      method: "POST",
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
      toast.success("Edycja utworzona");
      setDialogOpen(false);
      resetForm();
      loadEditions();
    } else {
      const data = await res.json();
      toast.error(data.error || "Błąd tworzenia edycji");
    }
    setCreating(false);
  }

  function resetForm() {
    setName("");
    setYear(new Date().getFullYear().toString());
    setEventDate("");
    setEventDateDisplay("");
    setLocation("");
    setDescription("");
    setInstagramEmbedUrl("");
  }

  async function toggleApplicationsOpen(editionId: string, open: boolean) {
    setTogglingId(editionId);
    const res = await fetch(`/api/admin/editions/${editionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applications_open: open }),
    });

    if (res.ok) {
      toast.success(open ? "Zapisy otwarte" : "Zapisy zamknięte");
      loadEditions();
    } else {
      const data = await res.json();
      toast.error(data.error || "Błąd aktualizacji");
    }
    setTogglingId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold">Edycje</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-red hover:bg-brand-red/90">
              <Plus className="w-4 h-4 mr-2" />
              Nowa edycja
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nowa edycja</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nazwa *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="np. Summer Code 2.0"
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
                  placeholder="np. Resort Piaseczno"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Opis</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram_embed_url">Instagram embed URL</Label>
                <Input
                  id="instagram_embed_url"
                  value={instagramEmbedUrl}
                  onChange={(e) => setInstagramEmbedUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/.../embed"
                />
              </div>
              <Button
                onClick={createEdition}
                disabled={creating || !name || !year}
                className="w-full bg-brand-red hover:bg-brand-red/90"
              >
                {creating ? "Tworzenie..." : "Utwórz edycję"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nazwa</TableHead>
              <TableHead>Rok</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Lokalizacja</TableHead>
              <TableHead>Zgłoszenia</TableHead>
              <TableHead>Zapisy otwarte</TableHead>
              <TableHead>Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  Brak edycji
                </TableCell>
              </TableRow>
            ) : (
              editions.map((edition) => (
                <TableRow key={edition.id}>
                  <TableCell className="font-medium">{edition.name}</TableCell>
                  <TableCell>{edition.year}</TableCell>
                  <TableCell>
                    {edition.event_date_display || edition.event_date || "—"}
                  </TableCell>
                  <TableCell>{edition.location || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {edition.applications?.[0]?.count ?? 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={edition.applications_open}
                      onCheckedChange={(checked) =>
                        toggleApplicationsOpen(edition.id, checked)
                      }
                      disabled={togglingId === edition.id}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/edycje/${edition.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
