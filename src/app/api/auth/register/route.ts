import { NextResponse } from "next/server";
import { hashPassword, createSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { RegistrationWelcomeEmail } from "@/lib/email/templates/registration-welcome";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, full_name } = body;

  if (!email || !password || !full_name) {
    return NextResponse.json(
      { error: "Wszystkie pola są wymagane" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Hasło musi mieć minimum 6 znaków" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "Konto z tym adresem email już istnieje" },
      { status: 409 }
    );
  }

  const password_hash = await hashPassword(password);

  const { data: profile, error } = await supabase
    .from("profiles")
    .insert({ email, full_name, password_hash })
    .select("id")
    .single();

  if (error || !profile) {
    return NextResponse.json(
      { error: "Nie udało się utworzyć konta" },
      { status: 500 }
    );
  }

  await createSession(profile.id);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  sendEmail({
    to: email,
    subject: "Witamy w Wanted Society!",
    react: RegistrationWelcomeEmail({ userName: full_name, loginUrl: siteUrl }),
    template: "registration_welcome",
    relatedId: profile.id,
  }).catch((err) => console.error("[register] Welcome email failed:", err));

  return NextResponse.json({ success: true });
}
