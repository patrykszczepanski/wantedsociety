import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";

const SESSION_COOKIE = "session_id";
const SESSION_DURATION_DAYS = 30;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const supabase = createAdminClient();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  const { data, error } = await supabase
    .from("sessions")
    .insert({ user_id: userId, expires_at: expiresAt.toISOString() })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Failed to create session");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, data.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  });

  return data.id;
}

export async function getSession(): Promise<{
  session: { id: string; user_id: string; expires_at: string };
  profile: Profile;
} | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  return getSessionFromCookieValue(sessionId);
}

export async function getSessionFromCookieValue(
  sessionId: string
): Promise<{
  session: { id: string; user_id: string; expires_at: string };
  profile: Profile;
} | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("sessions")
    .select("id, user_id, expires_at, profiles(*)")
    .eq("id", sessionId)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !data || !data.profiles) return null;

  const profile = data.profiles as unknown as Profile;

  return {
    session: {
      id: data.id,
      user_id: data.user_id,
      expires_at: data.expires_at,
    },
    profile,
  };
}

export async function getCurrentUser(): Promise<Profile | null> {
  const result = await getSession();
  return result?.profile ?? null;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) {
    const supabase = createAdminClient();
    await supabase.from("sessions").delete().eq("id", sessionId);
  }

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
