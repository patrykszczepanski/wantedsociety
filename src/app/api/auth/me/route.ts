import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      instagram_handle: user.instagram_handle,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  });
}
