import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { APPLICATION_TYPES, APPLICATION_STATUSES, INSTAGRAM_URL } from "@/lib/constants";
import type { Application, ApplicationType, ApplicationStatus, EventEdition } from "@/lib/types";
import type { Metadata } from "next";
import { Instagram } from "lucide-react";

export const metadata: Metadata = {
  title: "Moje zgłoszenia",
};

const statusColors: Record<ApplicationStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  accepted: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
};

function getApplicationTitle(app: Application): string {
  const data = app.data as unknown as Record<string, unknown>;
  switch (app.type) {
    case "exhibitor": {
      const carName = data.car_name as string;
      const plate = data.license_plate as string;
      if (!carName) return APPLICATION_TYPES[app.type];
      return plate ? `${carName} · ${plate}` : carName;
    }
    case "media":
      return (data.instagram_handle as string) || APPLICATION_TYPES[app.type];
    case "partner":
      return (data.company_name as string) || APPLICATION_TYPES[app.type];
    default:
      return APPLICATION_TYPES[app.type];
  }
}

function ApplicationCard({ app }: { app: Application }) {
  return (
    <Link href={`/zgloszenia/${app.id}`}>
      <Card className="hover:border-brand-red/50 transition-colors cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {getApplicationTitle(app)}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {APPLICATION_TYPES[app.type]}
            </p>
          </div>
          <Badge className={statusColors[app.status]}>
            {APPLICATION_STATUSES[app.status]}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Złożone:{" "}
            {new Date(app.created_at).toLocaleDateString("pl-PL")}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function ApplicationsPage() {
  const user = await getCurrentUser();
  const supabase = createAdminClient();

  // Fetch active edition
  const { data: activeEditionData } = await supabase
    .from("event_editions")
    .select("*")
    .eq("applications_open", true)
    .single();

  const activeEdition = activeEditionData as EventEdition | null;

  // Fetch all user applications with edition info
  const { data: applications } = await supabase
    .from("applications")
    .select("*, event_editions(id, name, year, applications_open)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const allApps = (applications as Application[] | null) ?? [];

  // Partition into current and archived
  const currentEditionApps = activeEdition
    ? allApps.filter((a) => a.event_edition_id === activeEdition.id)
    : [];
  const archivedApps = activeEdition
    ? allApps.filter((a) => a.event_edition_id !== activeEdition.id)
    : allApps;

  // Available types for new applications (only current edition)
  const currentTypes = new Set(currentEditionApps.map((a) => a.type));
  const availableTypes = activeEdition
    ? (Object.keys(APPLICATION_TYPES) as ApplicationType[]).filter(
        (t) => !currentTypes.has(t)
      )
    : [];

  // Group archived apps by edition
  const archivedByEdition = new Map<string, { name: string; year: number; apps: Application[] }>();
  for (const app of archivedApps) {
    const editionName = app.event_editions?.name ?? "Nieznana edycja";
    const editionYear = app.event_editions?.year ?? 0;
    const key = app.event_edition_id;
    if (!archivedByEdition.has(key)) {
      archivedByEdition.set(key, { name: editionName, year: editionYear, apps: [] });
    }
    archivedByEdition.get(key)!.apps.push(app);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <h1 className="font-heading text-4xl font-bold mb-8">
        Moje <span className="text-brand-red">zgłoszenia</span>
      </h1>

      {activeEdition ? (
        <>
          {/* Edition header */}
          <div className="mb-6">
            <h2 className="font-heading text-xl text-brand-gold">
              {activeEdition.name} — {activeEdition.year}
            </h2>
          </div>

          {/* New application buttons */}
          {availableTypes.length > 0 && (
            <div className="mb-8">
              <p className="text-muted-foreground mb-3">Złóż nowe zgłoszenie:</p>
              <div className="flex flex-wrap gap-3">
                {availableTypes.map((type) => (
                  <Button key={type} asChild variant="outline">
                    <Link href={`/zgloszenia/nowe/${type}`}>
                      {APPLICATION_TYPES[type]}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Current edition applications */}
          {currentEditionApps.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Nie masz jeszcze żadnych zgłoszeń na tę edycję. Złóż swoje pierwsze!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {currentEditionApps.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </>
      ) : (
        /* Applications closed */
        <Card className="border-brand-gold/20">
          <CardContent className="py-12 text-center space-y-4">
            <h2 className="font-heading text-2xl font-bold">
              Zgłoszenia zamknięte
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Aktualnie nie prowadzimy naboru zgłoszeń. Śledź nas na Instagramie,
              żeby nie przegapić otwarcia zgłoszeń na kolejną edycję!
            </p>
            <Button asChild variant="outline" className="mt-2">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Archive section */}
      {archivedByEdition.size > 0 && (
        <>
          <Separator className="my-10" />
          <h2 className="font-heading text-2xl font-bold mb-6 text-muted-foreground">
            Archiwum
          </h2>
          <div className="space-y-8">
            {Array.from(archivedByEdition.entries())
              .sort(([, a], [, b]) => b.year - a.year)
              .map(([editionId, { name, year, apps }]) => (
                <div key={editionId}>
                  <h3 className="font-heading text-lg text-muted-foreground mb-3">
                    {name} — {year}
                  </h3>
                  <div className="space-y-3 opacity-70">
                    {apps.map((app) => (
                      <ApplicationCard key={app.id} app={app} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
