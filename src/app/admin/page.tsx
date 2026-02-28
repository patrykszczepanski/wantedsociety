import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  const [
    { count: totalApps },
    { count: pendingApps },
    { count: acceptedApps },
    { count: rejectedApps },
    { count: cabinReservations },
    { count: cabinPaid },
  ] = await Promise.all([
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "accepted"),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected"),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("wants_cabin", true),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("wants_cabin", true)
      .eq("cabin_payment_confirmed", true),
  ]);

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
    </div>
  );
}
