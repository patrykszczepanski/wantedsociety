"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Check, X } from "lucide-react";
import { CABIN_ELIGIBLE_TYPES } from "@/lib/constants";

function getApplicationDetail(app: Application): string | null {
  if (app.type === "exhibitor" && "car_name" in app.data) return (app.data as { car_name: string }).car_name;
  if (app.type === "media" && "instagram_handle" in app.data) return (app.data as { instagram_handle: string }).instagram_handle;
  if (app.type === "partner" && "company_name" in app.data) return (app.data as { company_name: string }).company_name;
  return null;
}

const statusColors: Record<ApplicationStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  accepted: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [editions, setEditions] = useState<EventEdition[]>([]);
  const [editionFilter, setEditionFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const loadApplications = useCallback(async () => {
    const params = editionFilter !== "all" ? `?edition_id=${editionFilter}` : "";
    const res = await fetch(`/api/admin/applications${params}`);
    if (res.ok) {
      const data = await res.json();
      setApplications(data || []);
    }
  }, [editionFilter]);

  useEffect(() => {
    async function loadEditions() {
      const res = await fetch("/api/admin/editions");
      if (res.ok) {
        const data = await res.json();
        setEditions(data ?? []);
        // Default to active edition
        const active = data?.find((e: EventEdition) => e.applications_open);
        if (active) setEditionFilter(active.id);
      }
    }
    loadEditions();
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const filtered = applications.filter((app) => {
    if (typeFilter !== "all" && app.type !== typeFilter) return false;
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const data = JSON.stringify(app.data).toLowerCase();
      const name = (app.profiles?.full_name ?? "").toLowerCase();
      if (!data.includes(q) && !name.includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-8">Zgłoszenia</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <Input
          placeholder="Szukaj..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
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
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie typy</SelectItem>
            <SelectItem value="exhibitor">Wystawca</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            <SelectItem value="pending">Oczekujące</SelectItem>
            <SelectItem value="accepted">Zaakceptowane</SelectItem>
            <SelectItem value="rejected">Odrzucone</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Użytkownik</TableHead>
              <TableHead>Edycja</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Domek</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Brak zgłoszeń
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>{app.profiles?.full_name ?? "—"}</div>
                    <div className="text-sm text-muted-foreground">{getApplicationDetail(app)}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {app.event_editions?.name ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>{APPLICATION_TYPES[app.type]}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[app.status]}>
                      {APPLICATION_STATUSES[app.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {CABIN_ELIGIBLE_TYPES.includes(app.type) ? (
                      app.wants_cabin ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground" />
                      )
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(app.created_at).toLocaleDateString("pl-PL")}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/zgloszenia/${app.id}`}
                      className="text-brand-red hover:underline text-sm"
                    >
                      Szczegóły
                    </Link>
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
