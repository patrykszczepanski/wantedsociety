import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["cabin_price_pln", "cabin_payment_deadline_message"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settings: Record<string, string> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value;
  }

  return NextResponse.json({
    cabin_price_pln: Number(settings.cabin_price_pln ?? "250"),
    cabin_payment_deadline_message:
      settings.cabin_payment_deadline_message ?? "",
  });
}
