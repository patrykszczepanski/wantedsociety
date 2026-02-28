import { NextResponse } from "next/server";
import { getResend, FROM_EMAIL } from "@/lib/email/resend";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Wszystkie pola są wymagane" },
      { status: 400 }
    );
  }

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: process.env.ADMIN_EMAIL || FROM_EMAIL,
      subject: `Kontakt: ${name}`,
      text: `Imię: ${name}\nEmail: ${email}\n\nWiadomość:\n${message}`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Nie udało się wysłać wiadomości" },
      { status: 500 }
    );
  }
}
