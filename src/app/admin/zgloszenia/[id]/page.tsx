"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConversationThread } from "@/components/applications/conversation-thread";
import { ApplicationPhotos } from "@/components/applications/application-photos";
import { APPLICATION_TYPES, APPLICATION_STATUSES, CABIN_ELIGIBLE_TYPES } from "@/lib/constants";
import type { Application, ApplicationStatus, ExhibitorData } from "@/lib/types";
import { Check, Home, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const statusColors: Record<ApplicationStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  accepted: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

export default function AdminApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [togglingCabin, setTogglingCabin] = useState(false);

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.user) setUserId(meData.user.id);
      }

      const res = await fetch(`/api/applications/${id}`);
      if (res.ok) {
        const data = await res.json();
        setApplication(data);
      }
    }
    load();
  }, [id]);

  async function updateStatus(status: ApplicationStatus) {
    setUpdating(true);
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setApplication(data);
    }
    setUpdating(false);
  }

  async function toggleCabinPayment(confirmed: boolean) {
    setTogglingCabin(true);
    const res = await fetch(`/api/admin/cabins/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cabin_payment_confirmed: confirmed }),
    });
    if (res.ok) {
      setApplication((prev) =>
        prev ? { ...prev, cabin_payment_confirmed: confirmed } : prev
      );
    }
    setTogglingCabin(false);
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        &larr; Wróć
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading text-2xl">
            {APPLICATION_TYPES[application.type]}
          </CardTitle>
          <Badge className={statusColors[application.status]}>
            {APPLICATION_STATUSES[application.status]}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Złożone:{" "}
            {new Date(application.created_at).toLocaleDateString("pl-PL")}
          </p>

          <Separator />

          <div className="space-y-2">
            {Object.entries(
              application.data as unknown as Record<string, unknown>
            ).map(([key, value]) => {
              if (key === "photo_paths") return null;
              return (
                <div key={key}>
                  <span className="text-sm font-medium text-muted-foreground capitalize">
                    {key.replace(/_/g, " ")}:
                  </span>{" "}
                  <span className="text-sm">{String(value)}</span>
                </div>
              );
            })}
          </div>

          {application.type === "exhibitor" && (
            <>
              <Separator />
              <ApplicationPhotos
                paths={
                  (application.data as ExhibitorData).photo_paths ?? []
                }
              />
            </>
          )}

          {CABIN_ELIGIBLE_TYPES.includes(application.type) && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-brand-gold" />
                  <span className="text-sm font-medium">Domek:</span>
                  <Badge
                    className={
                      application.wants_cabin
                        ? "bg-green-500/20 text-green-400"
                        : "bg-zinc-500/20 text-zinc-400"
                    }
                  >
                    {application.wants_cabin ? "Tak" : "Nie"}
                  </Badge>
                </div>
                {application.wants_cabin && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      Płatność:
                    </span>
                    <Badge
                      className={
                        application.cabin_payment_confirmed
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }
                    >
                      {application.cabin_payment_confirmed
                        ? "Opłacone"
                        : "Nieopłacone"}
                    </Badge>
                    <Switch
                      checked={application.cabin_payment_confirmed}
                      onCheckedChange={toggleCabinPayment}
                      disabled={togglingCabin}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          <div className="flex gap-3">
            <Button
              onClick={() => updateStatus("accepted")}
              disabled={updating || application.status === "accepted"}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Akceptuj
            </Button>
            <Button
              onClick={() => updateStatus("rejected")}
              disabled={updating || application.status === "rejected"}
              variant="destructive"
            >
              <X className="w-4 h-4 mr-2" />
              Odrzuć
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Konwersacja</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ConversationThread
            applicationId={application.id}
            currentUserId={userId}
            isAdmin
          />
        </CardContent>
      </Card>
    </div>
  );
}
