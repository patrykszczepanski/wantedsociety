import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { ApplicationStatusEmail } from "@/lib/email/templates/application-status";
import { APPLICATION_TYPES } from "@/lib/constants";
import type { ApplicationType } from "@/lib/types";

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
    .from("applications")
    .select("*, event_editions(id, name, year, applications_open)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { status } = body;

  if (!["pending", "accepted", "rejected"].includes(status)) {
    return NextResponse.json(
      { error: "Nieprawidłowy status" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send status change email for accepted/rejected
  if (status === "accepted" || status === "rejected") {
    const { data: appWithUser } = await supabase
      .from("applications")
      .select("type, user_id, profiles!user_id(email, full_name)")
      .eq("id", id)
      .single();

    if (appWithUser) {
      const profile = appWithUser.profiles as unknown as { email: string; full_name: string } | null;
      if (profile) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const appType = APPLICATION_TYPES[appWithUser.type as ApplicationType] || appWithUser.type;
        sendEmail({
          to: profile.email,
          subject: `Zgłoszenie ${appType} — ${status === "accepted" ? "zaakceptowane" : "odrzucone"}`,
          react: ApplicationStatusEmail({
            userName: profile.full_name,
            applicationType: appType,
            status,
            applicationUrl: `${siteUrl}/zgloszenia`,
          }),
          template: "application_status",
          applicationId: id,
          relatedId: id,
        }).catch((err) => console.error("[applications] Status email failed:", err));
      }
    }
  }

  return NextResponse.json(data);
}
