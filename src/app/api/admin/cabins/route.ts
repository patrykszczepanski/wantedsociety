import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const editionId = searchParams.get("edition_id");

  const supabase = createAdminClient();
  let query = supabase
    .from("applications")
    .select("*, profiles(email, full_name), event_editions(id, name, year)")
    .eq("wants_cabin", true)
    .order("created_at", { ascending: false });

  if (editionId) {
    query = query.eq("event_edition_id", editionId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
