import {
  Text,
  Heading,
  Link,
  Hr,
} from "@react-email/components";
import { EmailLayout } from "./shared-layout";

interface RegistrationWelcomeEmailProps {
  userName: string;
  loginUrl: string;
}

export function RegistrationWelcomeEmail({
  userName,
  loginUrl,
}: RegistrationWelcomeEmailProps) {
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
        Witamy w Wanted Society!
      </Heading>

      <Text style={{ color: "#CCCCCC", fontSize: "15px", lineHeight: "1.7" }}>
        Twoje konto zostalo pomyslnie utworzone.
      </Text>

      <Text style={{ color: "#CCCCCC", fontSize: "15px", lineHeight: "1.7" }}>
        Mozesz teraz skladac zgloszenia na nasze wydarzenia motoryzacyjne.
      </Text>

      <Link
        href={loginUrl}
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
        Przejdz do strony
      </Link>

      <Hr style={{ borderColor: "#333", margin: "24px 0" }} />

      <Text style={{ color: "#888", fontSize: "13px", lineHeight: "1.6" }}>
        Pozdrawiamy,{"\n"}
        Ekipa Wanted Society
      </Text>
    </EmailLayout>
  );
}
