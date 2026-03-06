import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { NewMessageEmail } from "@/lib/email/templates/new-message";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("application_messages")
    .select("*, profiles!sender_id(full_name)")
    .eq("application_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const messages = data?.map(({ profiles, ...msg }: Record<string, unknown>) => ({
    ...msg,
    sender_name: (profiles as { full_name: string } | null)?.full_name ?? "Użytkownik",
  }));

  return NextResponse.json(messages);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { content, is_admin } = body;

  if (!content?.trim()) {
    return NextResponse.json(
      { error: "Wiadomość nie może być pusta" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("application_messages")
    .insert({
      application_id: id,
      sender_id: user.id,
      content: content.trim(),
      is_admin: is_admin || false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send email notification to the other party
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const messagePreview = content.trim().substring(0, 200);

  if (is_admin) {
    // Admin sent message -> email the application owner
    const { data: app } = await supabase
      .from("applications")
      .select("user_id, profiles!user_id(email, full_name)")
      .eq("id", id)
      .single();

    if (app) {
      const profile = app.profiles as unknown as { email: string; full_name: string } | null;
      if (profile) {
        sendEmail({
          to: profile.email,
          subject: "Nowa wiadomość od Wanted Society",
          react: NewMessageEmail({
            recipientName: profile.full_name,
            senderName: "Administrator",
            messagePreview,
            applicationUrl: `${siteUrl}/zgloszenia`,
          }),
          template: "new_message",
          applicationId: id,
          relatedId: id,
        }).catch((err) => console.error("[messages] Notification email failed:", err));
      }
    }
  } else {
    // User sent message -> email admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      sendEmail({
        to: adminEmail,
        subject: `Nowa wiadomość od ${user.full_name}`,
        react: NewMessageEmail({
          recipientName: "Admin",
          senderName: user.full_name,
          messagePreview,
          applicationUrl: `${siteUrl}/admin/zgloszenia`,
        }),
        template: "new_message_admin",
        applicationId: id,
        relatedId: id,
      }).catch((err) => console.error("[messages] Admin notification email failed:", err));
    }
  }

  return NextResponse.json({ ...data, sender_name: user.full_name }, { status: 201 });
}
