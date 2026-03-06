import {
  Section,
  Text,
  Link,
  Hr,
} from "@react-email/components";
import { EmailLayout } from "./shared-layout";

interface NewMessageEmailProps {
  recipientName: string;
  senderName: string;
  messagePreview: string;
  applicationUrl: string;
}

export function NewMessageEmail({
  recipientName,
  senderName,
  messagePreview,
  applicationUrl,
}: NewMessageEmailProps) {
  return (
    <EmailLayout>
      <Text style={{ color: "#FFFFFF", fontSize: "16px", lineHeight: "1.6" }}>
        Czesc {recipientName}!
      </Text>

      <Text style={{ color: "#CCCCCC", fontSize: "15px", lineHeight: "1.7" }}>
        Masz nowa wiadomosc od <strong style={{ color: "#FFFFFF" }}>{senderName}</strong>:
      </Text>

      <Section
        style={{
          backgroundColor: "#222",
          borderRadius: "8px",
          padding: "16px",
          margin: "16px 0",
          borderLeft: "4px solid #E8344E",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: "14px", margin: 0, lineHeight: "1.6" }}>
          {messagePreview}
        </Text>
      </Section>

      <Link
        href={applicationUrl}
        style={{
          display: "inline-block",
          backgroundColor: "#E8344E",
          color: "#FFFFFF",
          padding: "12px 24px",
          borderRadius: "6px",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: "bold",
          marginTop: "8px",
        }}
      >
        Zobacz konwersacje
      </Link>

      <Hr style={{ borderColor: "#333", margin: "24px 0" }} />

      <Text style={{ color: "#666", fontSize: "12px", lineHeight: "1.5" }}>
        Mozesz odpowiedziec bezposrednio na tego maila, a Twoja wiadomosc pojawi sie
        w konwersacji przy zgloszeniu.
      </Text>
    </EmailLayout>
  );
}
