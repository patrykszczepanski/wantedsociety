import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();

  // Fetch all messages in this thread
  const { data: messages, error } = await supabase
    .from("inbound_emails")
    .select(
      `
      *,
      applications:application_id (
        id,
        type,
        data,
        event_editions:event_edition_id (name, year)
      )
    `
    )
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  // Mark all unread messages in thread as read
  await supabase
    .from("inbound_emails")
    .update({ status: "read" })
    .eq("thread_id", threadId)
    .eq("status", "unread");

  // Extract application from first message that has one
  const application =
    messages.find((m: { applications: unknown }) => m.applications)
      ?.applications || null;

  return NextResponse.json({ messages, application });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { status } = body;

  if (!status || !["unread", "read", "archived"].includes(status)) {
    return NextResponse.json({ error: "Nieprawidłowy status" }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (status === "unread") {
    // Only mark the latest inbound message as unread
    const { data: latest } = await supabase
      .from("inbound_emails")
      .select("id")
      .eq("thread_id", threadId)
      .eq("direction", "inbound")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (latest) {
      await supabase
        .from("inbound_emails")
        .update({ status: "unread" })
        .eq("id", latest.id);
    }
  } else {
    // Update all messages in thread
    await supabase
      .from("inbound_emails")
      .update({ status })
      .eq("thread_id", threadId);
  }

  return NextResponse.json({ success: true });
}
