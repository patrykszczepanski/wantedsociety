import { getResend, FROM_EMAIL } from "./resend";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ReactElement } from "react";

const REPLY_DOMAIN = process.env.NEXT_PUBLIC_SITE_URL?.includes("wantedsociety.pl")
  ? "wantedsociety.pl"
  : "wantedsociety.pl";

interface SendEmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
  template: string;
  applicationId?: string;
  relatedId?: string;
}

export async function sendEmail({
  to,
  subject,
  react,
  template,
  applicationId,
  relatedId,
}: SendEmailOptions): Promise<string | null> {
  try {
    const replyTo = applicationId
      ? `reply+${applicationId}@${REPLY_DOMAIN}`
      : undefined;

    const { data, error } = await getResend().emails.send({
      from: `Wanted Society <${FROM_EMAIL}>`,
      to,
      subject,
      react,
      replyTo,
    });

    if (error) {
      console.error("[sendEmail] Resend error:", error);
      return null;
    }

    const resendId = data?.id ?? null;

    // Log to outbound_email_log (fire-and-forget)
    const supabase = createAdminClient();
    await supabase.from("outbound_email_log").insert({
      resend_id: resendId,
      to_email: to,
      from_email: FROM_EMAIL,
      subject,
      template,
      related_id: relatedId || applicationId || null,
      status: "sent",
    });

    return resendId;
  } catch (err) {
    console.error("[sendEmail] Unexpected error:", err);
    return null;
  }
}
