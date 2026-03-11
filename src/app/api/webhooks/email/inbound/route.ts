import { NextResponse } from "next/server";
import PostalMime from "postal-mime";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REPLY_TO_REGEX = /^reply\+([0-9a-f-]+)@/i;

function stripQuotedContent(text: string): string {
  const lines = text.split('\n');
  const resultLines: string[] = [];

  for (const line of lines) {
    if (/^On .+ wrote:\s*$/.test(line)) break;
    if (/^W dniu .+ napisał/.test(line)) break;
    if (/^-{2,}\s*Original Message\s*-{2,}/i.test(line) || /^-{2,}\s*Oryginalna wiadomość\s*-{2,}/i.test(line)) break;
    if (/^-{5,}\s*Forwarded message/i.test(line)) break;
    if (/^>/.test(line.trim())) continue;

    resultLines.push(line);
  }

  return resultLines.join('\n').trim();
}

export async function POST(request: Request) {
  // Verify webhook secret
  const secret = request.headers.get("X-Webhook-Secret");
  const expectedSecret = process.env.EMAIL_WEBHOOK_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: {
    from: string;
    to: string;
    subject: string;
    message_id: string;
    in_reply_to: string;
    raw: string;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { from, to, subject, message_id, in_reply_to, raw } = payload;

  // Parse raw email to extract text body
  let bodyText = "";
  let bodyHtml = "";
  let fromName = "";
  let emailAttachments: { filename: string; mimeType: string; content: Uint8Array }[] = [];

  if (raw) {
    try {
      const rawBytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
      const parser = new PostalMime();
      const parsed = await parser.parse(rawBytes);
      bodyText = parsed.text || "";
      bodyHtml = parsed.html || "";
      fromName = parsed.from?.name || "";

      // Extract image attachments
      if (parsed.attachments?.length) {
        emailAttachments = parsed.attachments
          .filter((a) => {
            if (!a.mimeType?.startsWith("image/")) return false;
            const buf = typeof a.content === "string" ? Buffer.from(a.content, "base64") : a.content;
            return buf.byteLength <= 10 * 1024 * 1024;
          })
          .map((a) => {
            const buf = typeof a.content === "string" ? Buffer.from(a.content, "base64") : a.content;
            return {
              filename: a.filename || "attachment.jpg",
              mimeType: a.mimeType || "image/jpeg",
              content: new Uint8Array(buf),
            };
          });
      }
    } catch (err) {
      console.error("[inbound-email] Failed to parse raw email:", err);
    }
  }

  // Extract sender email (handle "Name <email>" format)
  const fromEmail = from.includes("<")
    ? from.match(/<([^>]+)>/)?.[1] || from
    : from;

  const supabase = createAdminClient();

  // Extract application ID from reply-to address
  let applicationId: string | null = null;
  const replyMatch = to.match(REPLY_TO_REGEX);
  if (replyMatch && UUID_REGEX.test(replyMatch[1])) {
    const candidateId = replyMatch[1];
    const { data: app } = await supabase
      .from("applications")
      .select("id")
      .eq("id", candidateId)
      .single();
    if (app) {
      applicationId = app.id;
    }
  }

  // Match sender to a profile
  let senderId: string | null = null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", fromEmail.toLowerCase())
    .single();
  if (profile) {
    senderId = profile.id;
  }

  let applicationMessageId: string | null = null;

  // If we have both application and sender, create an application message
  if (applicationId && senderId) {
    // Determine if sender is admin
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", senderId)
      .single();

    const isAdmin = senderProfile?.role === "admin";
    const messageContent = stripQuotedContent(bodyText) || subject || "";

    // Upload email image attachments to storage
    const photoPaths: string[] = [];
    const emailId_ = crypto.randomUUID();
    for (const attachment of emailAttachments) {
      const safeName = attachment.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `email-attachments/${emailId_}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("application-photos")
        .upload(storagePath, attachment.content, { contentType: attachment.mimeType });
      if (!uploadError) {
        photoPaths.push(storagePath);
      } else {
        console.error("[inbound-email] Failed to upload attachment:", uploadError.message);
      }
    }

    if (messageContent || photoPaths.length > 0) {
      const { data: msg } = await supabase
        .from("application_messages")
        .insert({
          application_id: applicationId,
          sender_id: senderId,
          content: messageContent || "",
          is_admin: isAdmin,
          source: "email",
          photo_paths: photoPaths,
        })
        .select("id")
        .single();

      if (msg) {
        applicationMessageId = msg.id;
      }
    }
  }

  // Store inbound email record
  const status = applicationId && applicationMessageId ? "linked" : "unread";

  // Resolve thread_id
  const emailId = crypto.randomUUID();
  let threadId: string = emailId;

  // 1. If in_reply_to is set, find parent by message_id and reuse its thread_id
  if (in_reply_to) {
    const { data: parent } = await supabase
      .from("inbound_emails")
      .select("thread_id")
      .eq("message_id", in_reply_to)
      .limit(1)
      .single();
    if (parent) {
      threadId = parent.thread_id;
    }
  }

  // 2. If no thread found via in_reply_to, check for existing thread by application_id
  if (threadId === emailId && applicationId) {
    const { data: existing } = await supabase
      .from("inbound_emails")
      .select("thread_id")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();
    if (existing) {
      threadId = existing.thread_id;
    }
  }

  await supabase.from("inbound_emails").insert({
    id: emailId,
    message_id: message_id || null,
    in_reply_to: in_reply_to || null,
    from_email: fromEmail,
    from_name: fromName || null,
    to_email: to,
    subject: subject || null,
    body_text: stripQuotedContent(bodyText) || null,
    body_html: bodyHtml || null,
    application_id: applicationId,
    application_message_id: applicationMessageId,
    status,
    direction: "inbound",
    thread_id: threadId,
    raw_payload: payload,
  });

  return NextResponse.json({ success: true });
}
