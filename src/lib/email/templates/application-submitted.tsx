import {
  Text,
  Heading,
  Link,
  Hr,
} from "@react-email/components";
import { EmailLayout } from "./shared-layout";

interface ApplicationSubmittedEmailProps {
  userName: string;
  applicationType: string;
  editionName: string;
  applicationUrl: string;
}

export function ApplicationSubmittedEmail({
  userName,
  applicationType,
  editionName,
  applicationUrl,
}: ApplicationSubmittedEmailProps) {
  return (
    <EmailLayout>
      <Text style={{ color: "#FFFFFF", fontSize: "16px", lineHeight: "1.6" }}>
        Czesc {userName}!
      </Text>

      <Heading
        as="h2"
        style={{
          color: "#FFD700",
          fontSize: "20px",
          margin: "16px 0",
          fontFamily: "'Oswald', sans-serif",
        }}
      >
        Zgloszenie zostalo przyjete!
      </Heading>

      <Text style={{ color: "#CCCCCC", fontSize: "15px", lineHeight: "1.7" }}>
        Twoje zgloszenie typu <strong style={{ color: "#FFFFFF" }}>{applicationType}</strong> na
        edycje <strong style={{ color: "#FFFFFF" }}>{editionName}</strong> zostalo przyjete
        i oczekuje na rozpatrzenie.
      </Text>

      <Text style={{ color: "#CCCCCC", fontSize: "15px", lineHeight: "1.7" }}>
        Poinformujemy Cie o decyzji mailowo. Mozesz tez sledzic status na stronie.
      </Text>

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
          marginTop: "16px",
        }}
      >
        Zobacz zgloszenie
      </Link>

      <Hr style={{ borderColor: "#333", margin: "24px 0" }} />

      <Text style={{ color: "#888", fontSize: "13px", lineHeight: "1.6" }}>
        Pozdrawiamy,{"\n"}
        Ekipa Wanted Society
      </Text>
    </EmailLayout>
  );
}
