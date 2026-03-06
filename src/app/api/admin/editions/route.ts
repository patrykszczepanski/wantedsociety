import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { editionSchema } from "@/lib/validations/edition";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("event_editions")
    .select("*, applications(count)")
    .order("year", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  let validated;
  try {
    validated = editionSchema.parse(body);
  } catch {
    return NextResponse.json(
      { error: "Nieprawidłowe dane formularza" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("event_editions")
    .insert({
      name: validated.name,
      year: validated.year,
      event_date: validated.event_date || null,
      event_date_display: validated.event_date_display || null,
      location: validated.location || null,
      description: validated.description || null,
      instagram_embed_url: validated.instagram_embed_url || null,
      facebook_event_url: validated.facebook_event_url || null,
      applications_open: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
