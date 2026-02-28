import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {};

  if ("role" in body) {
    if (body.role !== "user" && body.role !== "admin") {
      return NextResponse.json(
        { error: "Role must be 'user' or 'admin'" },
        { status: 400 }
      );
    }
    if (id === user.id) {
      return NextResponse.json(
        { error: "Nie możesz zmienić własnej roli" },
        { status: 400 }
      );
    }
    updateData.role = body.role;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", id)
    .select("id, email, full_name, role, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
