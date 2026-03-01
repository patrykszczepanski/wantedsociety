import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApplicationsChart } from "@/components/admin/applications-chart";
import type { EventEdition } from "@/lib/types";

function buildDailyChartData(rows: { created_at: string }[]) {
  if (!rows.length) return [];

  const counts: Record<string, number> = {};
  for (const row of rows) {
    const date = row.created_at.slice(0, 10); // YYYY-MM-DD
    counts[date] = (counts[date] || 0) + 1;
  }

  const dates = Object.keys(counts).sort();
  const start = new Date(dates[0]);
  const end = new Date(dates[dates.length - 1]);
  const result: { date: string; count: number }[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: counts[key] || 0 });
  }

  return result;
}

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  // Fetch active edition
  const { data: activeEdition } = await supabase
    .from("event_editions")
    .select("*")
    .eq("applications_open", true)
    .single();

  const edition = activeEdition as EventEdition | null;

  // Build queries filtered by active edition if present
  function editionQuery() {
    let q = supabase.from("applications").select("*", { count: "exact", head: true });
    if (edition) q = q.eq("event_edition_id", edition.id);
    return q;
  }

  function chartQuery() {
    let q = supabase.from("applications").select("created_at");
    if (edition) q = q.eq("event_edition_id", edition.id);
    return q.order("created_at", { ascending: true });
  }

  const [
    { count: totalApps },
    { count: pendingApps },
    { count: acceptedApps },
    { count: rejectedApps },
    { count: cabinReservations },
    { count: cabinPaid },
    { data: chartRows },
  ] = await Promise.all([
    editionQuery(),
    editionQuery().eq("status", "pending"),
    editionQuery().eq("status", "accepted"),
    editionQuery().eq("status", "rejected"),
    editionQuery().eq("wants_cabin", true),
    editionQuery().eq("wants_cabin", true).eq("cabin_payment_confirmed", true),
    chartQuery(),
  ]);

  const chartData = buildDailyChartData(
    (chartRows as { created_at: string }[] | null) || []
  );

  const stats = [
    { label: "Wszystkie", value: totalApps || 0, color: "text-white" },
    { label: "Oczekujące", value: pendingApps || 0, color: "text-yellow-400" },
    {
      label: "Zaakceptowane",
      value: acceptedApps || 0,
      color: "text-green-400",
    },
    { label: "Odrzucone", value: rejectedApps || 0, color: "text-red-400" },
    {
      label: "Domki (rezerwacje)",
      value: cabinReservations || 0,
      color: "text-brand-gold",
    },
    {
      label: "Domki (opłacone)",
      value: cabinPaid || 0,
      color: "text-green-400",
    },
  ];

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-8">Dashboard</h1>

      {edition ? (
        <div className="mb-6 flex items-center gap-3">
          <span className="text-muted-foreground">Aktywna edycja:</span>
          <Badge className="bg-brand-red/20 text-brand-red">
            {edition.name} — {edition.year}
          </Badge>
        </div>
      ) : (
        <div className="mb-6">
          <Badge variant="outline" className="text-muted-foreground">
            Brak aktywnej edycji — statystyki dla wszystkich zgłoszeń
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <ApplicationsChart data={chartData} />
      </div>
    </div>
  );
}
