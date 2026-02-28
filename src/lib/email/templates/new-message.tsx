import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
} from "@react-email/components";

interface NewMessageEmailProps {
  recipientName: string;
  senderName: string;
  messagePreview: string;
}

export function NewMessageEmail({
  recipientName,
  senderName,
  messagePreview,
}: NewMessageEmailProps) {
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
              Cześć {recipientName}!
            </Text>
            <Text style={{ color: "#A0A0A0", fontSize: "14px" }}>
              Masz nową wiadomość od <strong>{senderName}</strong>:
            </Text>
            <Section
              style={{
                backgroundColor: "#333",
                borderRadius: "4px",
                padding: "12px",
                marginTop: "12px",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: "14px", margin: 0 }}>
                {messagePreview}
              </Text>
            </Section>
            <Text style={{ color: "#A0A0A0", fontSize: "14px", marginTop: "16px" }}>
              Zaloguj się na stronie, aby odpowiedzieć.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
