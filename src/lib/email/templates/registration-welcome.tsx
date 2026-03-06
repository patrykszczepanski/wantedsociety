import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Link,
} from "@react-email/components";

interface RegistrationWelcomeEmailProps {
  userName: string;
  loginUrl: string;
}

export function RegistrationWelcomeEmail({
  userName,
  loginUrl,
}: RegistrationWelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#1A1A1A", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
          <Heading style={{ color: "#FFFFFF", fontSize: "24px" }}>
            Wanted Society
          </Heading>
          <Section style={{ backgroundColor: "#222", borderRadius: "8px", padding: "24px" }}>
            <Text style={{ color: "#FFFFFF", fontSize: "16px" }}>
              Cześć {userName}!
            </Text>
            <Text style={{ color: "#A0A0A0", fontSize: "14px" }}>
              Witamy w Wanted Society! Twoje konto zostało pomyślnie utworzone.
            </Text>
            <Text style={{ color: "#A0A0A0", fontSize: "14px" }}>
              Możesz teraz składać zgłoszenia na nasze wydarzenia motoryzacyjne.
            </Text>
            <Link
              href={loginUrl}
              style={{
                display: "inline-block",
                backgroundColor: "#E8344E",
                color: "#FFFFFF",
                padding: "10px 20px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "bold",
                marginTop: "12px",
              }}
            >
              Przejdź do strony
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
