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
              Twoje zgłoszenie typu <strong style={{ color: "#FFFFFF" }}>{applicationType}</strong> na
              edycję <strong style={{ color: "#FFFFFF" }}>{editionName}</strong> zostało przyjęte
              i oczekuje na rozpatrzenie.
            </Text>
            <Text style={{ color: "#A0A0A0", fontSize: "14px" }}>
              Poinformujemy Cię o decyzji mailowo. Możesz też śledzić status na stronie.
            </Text>
            <Link
              href={applicationUrl}
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
              Zobacz zgłoszenie
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
