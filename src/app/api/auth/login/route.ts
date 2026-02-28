import { NextResponse } from "next/server";
import { verifyPassword, createSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email i hasło są wymagane" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, password_hash")
    .eq("email", email)
    .single();

  if (!profile) {
    return NextResponse.json(
      { error: "Nieprawidłowy email lub hasło" },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(password, profile.password_hash);
  if (!valid) {
    return NextResponse.json(
      { error: "Nieprawidłowy email lub hasło" },
      { status: 401 }
    );
  }

  await createSession(profile.id);

  return NextResponse.json({ success: true });
}
