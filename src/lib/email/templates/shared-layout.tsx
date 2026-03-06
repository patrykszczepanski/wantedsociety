import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Link,
  Text,
  Row,
  Column,
} from "@react-email/components";
import { getPublicStorageUrl } from "@/lib/supabase/storage";
import { INSTAGRAM_URL } from "@/lib/constants";

const LOGO_URL = getPublicStorageUrl("email-assets", "ws-logo-60.png");
const FOOTER_LOGO_URL = getPublicStorageUrl("email-assets", "ws-footer-logo.png");

const styles = {
  body: {
    backgroundColor: "#1A1A1A",
    fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    margin: "0" as const,
    padding: "0" as const,
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
  },
  headerBar: {
    background: "linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)",
    padding: "20px 24px",
    textAlign: "center" as const,
  },
  content: {
    padding: "32px 24px",
  },
  footerLinks: {
    padding: "24px",
    textAlign: "center" as const,
  },
  footerLink: {
    color: "#E8344E",
    fontSize: "14px",
    fontWeight: "600" as const,
    textDecoration: "none",
    margin: "0 8px",
  },
  footerBar: {
    background: "linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%)",
    padding: "20px 24px",
    textAlign: "center" as const,
  },
  footerText: {
    color: "#666",
    fontSize: "12px",
    margin: "8px 0 0 0",
  },
} as const;

interface EmailLayoutProps {
  children: React.ReactNode;
  facebookEventUrl?: string;
}

export function EmailLayout({ children, facebookEventUrl }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.headerBar}>
            <Img
              src={LOGO_URL}
              width="60"
              height="60"
              alt="Wanted Society"
              style={{ margin: "0 auto" }}
            />
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            {children}
          </Section>

          {/* Footer links */}
          <Section style={styles.footerLinks}>
            <Link href={INSTAGRAM_URL} style={styles.footerLink}>
              Instagram
            </Link>
            {facebookEventUrl && (
              <>
                <span style={{ color: "#444" }}> | </span>
                <Link href={facebookEventUrl} style={styles.footerLink}>
                  Wydarzenie na Facebooku
                </Link>
              </>
            )}
          </Section>

          {/* Footer bar */}
          <Section style={styles.footerBar}>
            <Img
              src={FOOTER_LOGO_URL}
              width="140"
              alt="Wanted Society"
              style={{ margin: "0 auto" }}
            />
            <Text style={styles.footerText}>
              &copy; {new Date().getFullYear()} Wanted Society. Wszystkie prawa zastrzezone.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export { styles };
