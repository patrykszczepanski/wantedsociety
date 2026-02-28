import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  exhibitorSchema,
  mediaSchema,
  partnerSchema,
} from "@/lib/validations/application";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
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
  const { data: application, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      type,
      data: validatedData,
      wants_cabin: wantsCabin,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Masz już zgłoszenie tego typu" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(application, { status: 201 });
}
