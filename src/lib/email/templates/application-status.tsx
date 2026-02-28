import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
} from "@react-email/components";

interface ApplicationStatusEmailProps {
  userName: string;
  applicationType: string;
  status: "accepted" | "rejected";
}

export function ApplicationStatusEmail({
  userName,
  applicationType,
  status,
}: ApplicationStatusEmailProps) {
  const statusText =
    status === "accepted" ? "zaakceptowane" : "odrzucone";
  const statusColor = status === "accepted" ? "#22c55e" : "#E8344E";

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
              Twoje zgłoszenie typu <strong>{applicationType}</strong> zostało{" "}
              <span style={{ color: statusColor, fontWeight: "bold" }}>
                {statusText}
              </span>
              .
            </Text>
            <Text style={{ color: "#A0A0A0", fontSize: "14px" }}>
              Zaloguj się na stronie, aby zobaczyć szczegóły.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
