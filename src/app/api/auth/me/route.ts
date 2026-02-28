import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  const { ...profile } = user;
  return NextResponse.json({
    user: {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      instagram_handle: profile.instagram_handle,
      role: profile.role,
      email_confirmed_at: profile.email_confirmed_at,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    },
  });
}
