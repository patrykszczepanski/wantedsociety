import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { editionSchema } from "@/lib/validations/edition";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("event_editions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  let validated;
  try {
    validated = editionSchema.partial().parse(body);
  } catch {
    return NextResponse.json(
      { error: "Nieprawidłowe dane formularza" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {};
  if (validated.name !== undefined) updateData.name = validated.name;
  if (validated.year !== undefined) updateData.year = validated.year;
  if (validated.event_date !== undefined) updateData.event_date = validated.event_date || null;
  if (validated.event_date_display !== undefined) updateData.event_date_display = validated.event_date_display || null;
  if (validated.location !== undefined) updateData.location = validated.location || null;
  if (validated.description !== undefined) updateData.description = validated.description || null;
  if (validated.instagram_embed_url !== undefined) updateData.instagram_embed_url = validated.instagram_embed_url || null;
  if (validated.applications_open !== undefined) updateData.applications_open = validated.applications_open;

  const { data, error } = await supabase
    .from("event_editions")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Zamknij najpierw aktywną edycję" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
