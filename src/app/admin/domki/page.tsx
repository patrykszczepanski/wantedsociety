"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APPLICATION_TYPES, APPLICATION_STATUSES } from "@/lib/constants";
import type { Application, ApplicationStatus, EventEdition } from "@/lib/types";

const statusColors: Record<ApplicationStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  accepted: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

export default function AdminDomkiPage() {
  const [cabinPrice, setCabinPrice] = useState("");
  const [deadlineMessage, setDeadlineMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [bookings, setBookings] = useState<Application[]>([]);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editions, setEditions] = useState<EventEdition[]>([]);
  const [editionFilter, setEditionFilter] = useState<string>("all");

  useEffect(() => {
    loadSettings();
    async function loadEditions() {
      const res = await fetch("/api/admin/editions");
      if (res.ok) {
        const data = await res.json();
        setEditions(data ?? []);
        const active = data?.find((e: EventEdition) => e.applications_open);
        if (active) setEditionFilter(active.id);
      }
    }
    loadEditions();
  }, []);

  const loadBookings = useCallback(async () => {
    const params = editionFilter !== "all" ? `?edition_id=${editionFilter}` : "";
    const res = await fetch(`/api/admin/cabins${params}`);
    if (res.ok) {
      const data = await res.json();
      setBookings(data ?? []);
    }
  }, [editionFilter]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function loadSettings() {
    const res = await fetch("/api/admin/settings");
    if (res.ok) {
      const data = await res.json();
      const map: Record<string, string> = {};
      for (const row of data) {
        map[row.key] = row.value;
      }
      setCabinPrice(map.cabin_price_pln ?? "250");
      setDeadlineMessage(map.cabin_payment_deadline_message ?? "");
    }
  }

  async function saveSettings() {
    setSaving(true);
    setSaved(false);

    await Promise.all([
      fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "cabin_price_pln", value: cabinPrice }),
      }),
      fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "cabin_payment_deadline_message",
          value: deadlineMessage,
        }),
      }),
    ]);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function togglePayment(appId: string, confirmed: boolean) {
    setTogglingId(appId);
    const res = await fetch(`/api/admin/cabins/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cabin_payment_confirmed: confirmed }),
    });
    if (res.ok) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === appId ? { ...b, cabin_payment_confirmed: confirmed } : b
        )
      );
    }
    setTogglingId(null);
  }

  const totalCabins = bookings.length;
  const paidCabins = bookings.filter((b) => b.cabin_payment_confirmed).length;
  const unpaidCabins = totalCabins - paidCabins;

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-8">Domki</h1>

      {/* Settings Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ustawienia domków</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cabin_price">Cena domku (PLN)</Label>
            <Input
              id="cabin_price"
              type="number"
              value={cabinPrice}
              onChange={(e) => setCabinPrice(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline_message">
              Wiadomość o terminie płatności
            </Label>
            <Textarea
              id="deadline_message"
              value={deadlineMessage}
              onChange={(e) => setDeadlineMessage(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-brand-red hover:bg-brand-red/90"
            >
              {saving ? "Zapisywanie..." : "Zapisz"}
            </Button>
            {saved && (
              <span className="text-sm text-green-400">Zapisano</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Razem rezerwacji
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalCabins}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Opłacone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">{paidCabins}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Nieopłacone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-400">{unpaidCabins}</p>
          </CardContent>
        </Card>
      </div>

      {/* Edition Filter */}
      <div className="mb-4">
        <Select value={editionFilter} onValueChange={setEditionFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Edycja" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie edycje</SelectItem>
            {editions.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name} — {e.year}
                {e.applications_open ? " (aktywna)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bookings Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Użytkownik</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Status zgłoszenia</TableHead>
              <TableHead>Płatność</TableHead>
              <TableHead>Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Brak rezerwacji domków
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>{booking.profiles?.full_name ?? "—"}</div>
                    <div className="text-sm text-muted-foreground">
                      {booking.profiles?.email}
                    </div>
                  </TableCell>
                  <TableCell>{APPLICATION_TYPES[booking.type]}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[booking.status]}>
                      {APPLICATION_STATUSES[booking.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {booking.cabin_payment_confirmed ? (
                      <Badge className="bg-green-500/20 text-green-400">
                        Opłacone
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500/20 text-yellow-400">
                        Nieopłacone
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={booking.cabin_payment_confirmed}
                        onCheckedChange={(checked) =>
                          togglePayment(booking.id, checked)
                        }
                        disabled={togglingId === booking.id}
                      />
                      <span className="text-sm text-muted-foreground">
                        {booking.cabin_payment_confirmed
                          ? "Opłacone"
                          : "Nieopłacone"}
                      </span>
                    </div>
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
