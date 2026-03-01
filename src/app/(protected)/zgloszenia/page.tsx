import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APPLICATION_TYPES, APPLICATION_STATUSES } from "@/lib/constants";
import type { Application, ApplicationType, ApplicationStatus } from "@/lib/types";
import type { Metadata } from "next";

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

export default async function ApplicationsPage() {
  const user = await getCurrentUser();
  const supabase = createAdminClient();

  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const existingTypes = new Set(
    (applications as Application[] | null)?.map((a) => a.type) || []
  );
  const availableTypes = (
    Object.keys(APPLICATION_TYPES) as ApplicationType[]
  ).filter((t) => !existingTypes.has(t));

  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <h1 className="font-heading text-4xl font-bold mb-8">
        Moje <span className="text-brand-red">zgłoszenia</span>
      </h1>

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

      {/* Existing applications */}
      {(!applications || applications.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nie masz jeszcze żadnych zgłoszeń. Złóż swoje pierwsze!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(applications as Application[]).map((app) => (
            <Link key={app.id} href={`/zgloszenia/${app.id}`}>
              <Card className="hover:border-brand-red/50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">
                    {getApplicationTitle(app)}
                  </CardTitle>
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
          ))}
        </div>
      )}
    </div>
  );
}
