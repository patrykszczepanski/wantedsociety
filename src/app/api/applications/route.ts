import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  exhibitorSchema,
  mediaSchema,
  partnerSchema,
} from "@/lib/validations/application";
import { sendEmail } from "@/lib/email/send";
import { ApplicationSubmittedEmail } from "@/lib/email/templates/application-submitted";
import { APPLICATION_TYPES } from "@/lib/constants";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*, event_editions(id, name, year, applications_open)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, data } = body;

  let validatedData;
  let wantsCabin = false;
  try {
    switch (type) {
      case "exhibitor": {
        const parsed = exhibitorSchema.parse(data);
        const { wants_cabin, ...formData } = parsed;
        wantsCabin = wants_cabin;
        validatedData = formData;
        break;
      }
      case "media": {
        const parsed = mediaSchema.parse(data);
        const { wants_cabin, ...formData } = parsed;
        wantsCabin = wants_cabin;
        validatedData = formData;
        break;
      }
      case "partner":
        validatedData = partnerSchema.parse(data);
        break;
      default:
        return NextResponse.json(
          { error: "Nieprawidłowy typ zgłoszenia" },
          { status: 400 }
        );
    }
  } catch {
    return NextResponse.json(
      { error: "Nieprawidłowe dane formularza" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Check for active edition
  const { data: activeEdition } = await supabase
    .from("event_editions")
    .select("id")
    .eq("applications_open", true)
    .single();

  if (!activeEdition) {
    return NextResponse.json(
      { error: "Zgłoszenia są aktualnie zamknięte" },
      { status: 403 }
    );
  }

  const { data: application, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      type,
      data: validatedData,
      wants_cabin: wantsCabin,
      event_edition_id: activeEdition.id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Masz już zgłoszenie tego typu na tę edycję" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send confirmation email to user (fire-and-forget)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const appType = APPLICATION_TYPES[type as keyof typeof APPLICATION_TYPES] || type;

  // Fetch edition name for the email
  const { data: edition } = await supabase
    .from("event_editions")
    .select("name")
    .eq("id", activeEdition.id)
    .single();

  sendEmail({
    to: user.email,
    subject: `Zgłoszenie ${appType} zostało przyjęte`,
    react: ApplicationSubmittedEmail({
      userName: user.full_name,
      applicationType: appType,
      editionName: edition?.name || "",
      applicationUrl: `${siteUrl}/zgloszenia`,
    }),
    template: "application_submitted",
    relatedId: application.id,
  }).catch((err) => console.error("[applications] Submission email failed:", err));

  // Notify admin about new application
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    sendEmail({
      to: adminEmail,
      subject: `Nowe zgłoszenie: ${appType} od ${user.full_name}`,
      react: ApplicationSubmittedEmail({
        userName: user.full_name,
        applicationType: appType,
        editionName: edition?.name || "",
        applicationUrl: `${siteUrl}/admin/zgloszenia`,
      }),
      template: "application_submitted_admin",
      relatedId: application.id,
    }).catch((err) => console.error("[applications] Admin notification email failed:", err));
  }

  return NextResponse.json(application, { status: 201 });
}
