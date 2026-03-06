import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();

  // Get the email
  const { data, error } = await supabase
    .from("inbound_emails")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  // Mark as read if unread
  if (data.status === "unread") {
    await supabase
      .from("inbound_emails")
      .update({ status: "read" })
      .eq("id", id);
    data.status = "read";
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.status && ["unread", "read", "linked", "archived"].includes(body.status)) {
    updates.status = body.status;
  }
  if (body.application_id !== undefined) {
    updates.application_id = body.application_id;
    if (body.application_id) {
      updates.status = "linked";
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Brak zmian" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("inbound_emails")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
