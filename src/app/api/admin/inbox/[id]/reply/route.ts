import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResend, FROM_EMAIL } from "@/lib/email/resend";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { content } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: "Treść jest wymagana" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Get the inbound email
  const { data: email, error } = await supabase
    .from("inbound_emails")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !email) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  // Send reply via Resend with threading headers
  const headers: Record<string, string> = {};
  if (email.message_id) {
    headers["In-Reply-To"] = email.message_id;
    headers["References"] = email.message_id;
  }

  const replyTo = email.application_id
    ? `reply+${email.application_id}@wantedsociety.pl`
    : undefined;

  const { error: sendError } = await getResend().emails.send({
    from: `Wanted Society <${FROM_EMAIL}>`,
    to: email.from_email,
    subject: `Re: ${email.subject || "Wiadomość"}`,
    text: content.trim(),
    replyTo,
    headers,
  });

  if (sendError) {
    return NextResponse.json({ error: "Nie udało się wysłać" }, { status: 500 });
  }

  // Log outbound email
  await supabase.from("outbound_email_log").insert({
    to_email: email.from_email,
    from_email: FROM_EMAIL,
    subject: `Re: ${email.subject || "Wiadomość"}`,
    template: "inbox_reply",
    related_id: email.application_id || null,
    status: "sent",
  });

  // If linked to application, also create an application_message
  if (email.application_id) {
    await supabase.from("application_messages").insert({
      application_id: email.application_id,
      sender_id: user.id,
      content: content.trim(),
      is_admin: true,
      source: "web",
    });
  }

  // Mark original as read
  if (email.status === "unread") {
    await supabase
      .from("inbound_emails")
      .update({ status: "read" })
      .eq("id", id);
  }

  return NextResponse.json({ success: true });
}
