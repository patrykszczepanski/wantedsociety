import {
  Section,
  Text,
  Heading,
  Link,
  Img,
  Hr,
} from "@react-email/components";
import { EmailLayout } from "./shared-layout";
import { getPublicStorageUrl } from "@/lib/supabase/storage";

const BANNER_URL = getPublicStorageUrl("email-assets", "wyniki-banner.png");

interface ApplicationStatusEmailProps {
  userName: string;
  applicationType: "exhibitor" | "media";
  status: "accepted" | "rejected";
  applicationUrl: string;
  facebookEventUrl?: string;
}

export function ApplicationStatusEmail({
  userName,
  applicationType,
  status,
  applicationUrl,
  facebookEventUrl,
}: ApplicationStatusEmailProps) {
  return (
    <EmailLayout facebookEventUrl={facebookEventUrl}>
      {/* Banner */}
      <Img
        src={BANNER_URL}
        width="600"
        alt="Wyniki zgloszenia"
        style={{ width: "100%", borderRadius: "8px", marginBottom: "24px" }}
      />

      <Text style={{ color: "#FFFFFF", fontSize: "16px", lineHeight: "1.6" }}>
        Hej {userName}!
      </Text>

      {status === "accepted" ? (
        <AcceptedContent applicationType={applicationType} applicationUrl={applicationUrl} />
      ) : (
        <RejectedContent applicationUrl={applicationUrl} />
      )}
    </EmailLayout>
  );
}

function AcceptedContent({
  applicationType,
  applicationUrl,
}: {
  applicationType: "exhibitor" | "media";
  applicationUrl: string;
}) {
  return (
    <>
      <Heading
        as="h2"
        style={{
          color: "#22c55e",
          fontSize: "22px",
          margin: "16px 0",
          fontFamily: "'Oswald', sans-serif",
        }}
      >
        Twoje zgloszenie zostalo zaakceptowane!
      </Heading>

      <Text style={{ color: "#CCCCCC", fontSize: "15px", lineHeight: "1.7" }}>
        Mega sie cieszymy, ze dolaczysz do nas na wydarzeniu – bedzie grubo!
      </Text>

      {applicationType === "exhibitor" ? (
        <Section
          style={{
            backgroundColor: "#222",
            borderRadius: "8px",
            padding: "20px",
            margin: "20px 0",
            borderLeft: "4px solid #22c55e",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: "14px", lineHeight: "1.7", margin: 0 }}>
            Na miejscu otrzymasz wyznaczone miejsce parkingowe na terenie wystawy.
            Szczegoly dotyczace lokalizacji i godzin wjazdu przekazemy wkrotce.
          </Text>
        </Section>
      ) : (
        <Section
          style={{
            backgroundColor: "#222",
            borderRadius: "8px",
            padding: "20px",
            margin: "20px 0",
            borderLeft: "4px solid #22c55e",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: "14px", lineHeight: "1.7", margin: 0 }}>
            Na miejscu otrzymasz identyfikator – umozliwi Ci on swobodne poruszanie sie
            po calym terenie eventu (lacznie ze scena). Dzieki temu bedziesz mial dostep
            do najlepszych kadrow!
          </Text>
        </Section>
      )}

      <Text style={{ color: "#CCCCCC", fontSize: "15px", lineHeight: "1.7" }}>
        Gotowy na zajawke?
      </Text>

      <Text style={{ color: "#CCCCCC", fontSize: "15px", lineHeight: "1.7" }}>
        Sledz nasz Instagram, zeby byc na biezaco z aktualnosciami!
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
        Zobacz swoje zgloszenie
      </Link>

      <Hr style={{ borderColor: "#333", margin: "24px 0" }} />

      <Text style={{ color: "#888", fontSize: "13px", lineHeight: "1.6" }}>
        Do zobaczenia na evencie!{"\n"}
        Ekipa Wanted Society
      </Text>
    </>
  );
}

function RejectedContent({ applicationUrl }: { applicationUrl: string }) {
  return (
    <>
      <Heading
        as="h2"
        style={{
          color: "#E8344E",
          fontSize: "22px",
          margin: "16px 0",
          fontFamily: "'Oswald', sans-serif",
        }}
      >
        Twoje zgloszenie nie spelnilo naszych kryteriow.
      </Heading>

      <Text style={{ color: "#CCCCCC", fontSize: "15px", lineHeight: "1.7" }}>
        Konkurencja byla ogromna, a liczba miejsc ograniczona – niestety tym razem
        sie nie udalo.
      </Text>

      <Text style={{ color: "#CCCCCC", fontSize: "15px", lineHeight: "1.7" }}>
        To jednak nie znaczy, ze nie mozesz byc czescia wydarzenia! Zapraszamy Cie
        jako widza – atmosfera bedzie niesamowita i na pewno nie pozalujesz.
      </Text>

      <Text style={{ color: "#CCCCCC", fontSize: "15px", lineHeight: "1.7" }}>
        Trzymamy kciuki za dalszy rozwoj projektu i liczymy, ze zobaczymy sie na
        kolejnej edycji!
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
        Zobacz szczegoly
      </Link>

      <Hr style={{ borderColor: "#333", margin: "24px 0" }} />

      <Text style={{ color: "#888", fontSize: "13px", lineHeight: "1.6" }}>
        Pozdrawiamy,{"\n"}
        Ekipa Wanted Society
      </Text>
    </>
  );
}
