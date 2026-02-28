import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConversationThread } from "@/components/applications/conversation-thread";
import { ApplicationPhotos } from "@/components/applications/application-photos";
import { APPLICATION_TYPES, APPLICATION_STATUSES, CABIN_ELIGIBLE_TYPES } from "@/lib/constants";
import type { Application, ApplicationStatus, ExhibitorData } from "@/lib/types";
import type { Metadata } from "next";
import { Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Szczegóły zgłoszenia",
};

const statusColors: Record<ApplicationStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  accepted: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) notFound();

  const supabase = createAdminClient();
  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (!application) notFound();

  const app = application as Application;

  let cabinDeadlineMessage = "";
  if (CABIN_ELIGIBLE_TYPES.includes(app.type) && app.wants_cabin) {
    const { data: setting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "cabin_payment_deadline_message")
      .single();
    cabinDeadlineMessage = setting?.value ?? "";
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-24 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading text-2xl">
            {APPLICATION_TYPES[app.type]}
          </CardTitle>
          <Badge className={statusColors[app.status]}>
            {APPLICATION_STATUSES[app.status]}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Złożone: {new Date(app.created_at).toLocaleDateString("pl-PL")}
          </p>
          <Separator />
          <div className="space-y-2">
            {Object.entries(app.data as unknown as Record<string, unknown>).map(
              ([key, value]) => {
                if (key === "photo_paths") return null;
                return (
                  <div key={key}>
                    <span className="text-sm text-muted-foreground capitalize">
                      {key.replace(/_/g, " ")}:
                    </span>{" "}
                    <span className="text-sm">{String(value)}</span>
                  </div>
                );
              }
            )}
          </div>

          {app.type === "exhibitor" && (
            <>
              <Separator />
              <ApplicationPhotos
                paths={(app.data as ExhibitorData).photo_paths ?? []}
              />
            </>
          )}

          {CABIN_ELIGIBLE_TYPES.includes(app.type) && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-brand-gold" />
                  <span className="text-sm font-medium">Domek:</span>
                  <Badge
                    className={
                      app.wants_cabin
                        ? "bg-green-500/20 text-green-400"
                        : "bg-zinc-500/20 text-zinc-400"
                    }
                  >
                    {app.wants_cabin ? "Tak" : "Nie"}
                  </Badge>
                </div>
                {app.wants_cabin && cabinDeadlineMessage && (
                  <p className="text-sm text-muted-foreground">
                    {cabinDeadlineMessage}
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Konwersacja</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ConversationThread
            applicationId={app.id}
            currentUserId={user.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
