import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || null;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  const [{ data: threads, error }, { data: totalData }] = await Promise.all([
    supabase.rpc("get_email_threads", {
      p_status: status,
      p_limit: limit,
      p_offset: offset,
    }),
    supabase.rpc("count_email_threads", { p_status: status }),
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = typeof totalData === "number" ? totalData : 0;

  // Enrich with application data
  const applicationIds = [
    ...new Set(
      (threads || [])
        .map((t: { application_id: string | null }) => t.application_id)
        .filter(Boolean)
    ),
  ] as string[];

  let applicationsMap: Record<string, unknown> = {};
  if (applicationIds.length > 0) {
    const { data: apps } = await supabase
      .from("applications")
      .select(
        "id, type, data, event_editions:event_edition_id (name, year)"
      )
      .in("id", applicationIds);

    if (apps) {
      applicationsMap = Object.fromEntries(
        apps.map((a: { id: string }) => [a.id, a])
      );
    }
  }

  const enriched = (threads || []).map(
    (t: { application_id: string | null }) => ({
      ...t,
      applications: t.application_id
        ? applicationsMap[t.application_id] || null
        : null,
    })
  );

  return NextResponse.json({ threads: enriched, total, page, limit });
}
