import { Img } from "@react-email/components";
import { EmailLayout, SignOff } from "./shared-layout";
import { getPublicStorageUrl } from "@/lib/supabase/storage";

const BANNER_URL = getPublicStorageUrl("email-assets", "results-banner.png");

interface ApplicationStatusEmailProps {
  userName: string;
  applicationType: "exhibitor" | "media";
  status: "accepted" | "rejected";
  applicationUrl: string;
  facebookEventUrl?: string;
}

export function ApplicationStatusEmail({
  applicationType,
  status,
  facebookEventUrl,
}: ApplicationStatusEmailProps) {
  return (
    <EmailLayout facebookEventUrl={facebookEventUrl}>
      {/* Banner image */}
      <Img
        src={BANNER_URL}
        width="600"
        alt="Wyniki zg\u0142oszenia"
        style={{ width: "100%", display: "block" }}
      />

      {/* Body content */}
      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
        <tr>
          <td style={{ padding: "20px", fontSize: "16px", lineHeight: "1.5", color: "#000000" }}>
            {status === "accepted" ? (
              <AcceptedContent applicationType={applicationType} facebookEventUrl={facebookEventUrl} />
            ) : (
              <RejectedContent facebookEventUrl={facebookEventUrl} />
            )}
          </td>
        </tr>
      </table>
    </EmailLayout>
  );
}

function AcceptedContent({
  applicationType,
  facebookEventUrl,
}: {
  applicationType: "exhibitor" | "media";
  facebookEventUrl?: string;
}) {
  return (
    <>
      <h1 style={{ fontSize: "24px", margin: "0 0 16px 0", color: "#000000" }}>
        {"Cze\u015B\u0107! \uD83D\uDC4B\uD83D\uDE04"}
      </h1>

      <p style={{ margin: "0 0 16px 0", fontSize: "16px", lineHeight: "1.5", color: "#000000" }}>
        {"Z rado\u015Bci\u0105 informujemy, \u017Ce "}
        <span style={{ color: "green" }}>
          <strong>{"Twoje zg\u0142oszenie zosta\u0142o zaakceptowane!"}</strong>
        </span>
      </p>

      <p style={{ margin: "0 0 16px 0", fontSize: "16px", lineHeight: "1.5", color: "#000000" }}>
        {"Mega si\u0119 cieszymy, \u017Ce do\u0142\u0105czysz do nas na wydarzeniu \u2013 "}
        <strong>{"b\u0119dzie grubo!"}</strong>
        {" \uD83D\uDCA5\uD83D\uDE97"}
      </p>

      {applicationType === "media" ? (
        <p style={{ margin: "0 0 16px 0", fontSize: "16px", lineHeight: "1.5", color: "#000000" }}>
          {"Na miejscu otrzymasz "}
          <strong>{"identyfikator"}</strong>
          {" \u2013 umo\u017Cliwi Ci on swobodne poruszanie si\u0119 po ca\u0142ym terenie eventu (\u0142\u0105cznie ze scen\u0105). Dzi\u0119ki temu b\u0119dziesz mia\u0142 dost\u0119p do najlepszych kadr\u00f3w!"}
        </p>
      ) : (
        <p style={{ margin: "0 0 16px 0", fontSize: "16px", lineHeight: "1.5", color: "#000000" }}>
          {"Na miejscu otrzymasz "}
          <strong>{"wyznaczone miejsce parkingowe"}</strong>
          {" na terenie wystawy. Szczeg\u00f3\u0142y dotycz\u0105ce lokalizacji i godzin wjazdu przeka\u017Cemy wkr\u00f3tce."}
        </p>
      )}

      <h1 style={{ fontSize: "24px", margin: "16px 0", color: "#000000" }}>
        {"Gotowy na zajawk\u0119? \u2728"}
      </h1>

      <p style={{ margin: "0 0 16px 0", fontSize: "16px", lineHeight: "1.5", color: "#000000" }}>
        {"Do zobaczenia na miejscu \u2013 b\u0119dzie klimat, auta, ludzie, zdj\u0119cia i nagrody! \uD83D\uDE97"}
        <br />
        {"Nie mo\u017Cemy si\u0119 doczeka\u0107! \uD83E\uDD75\uD83D\uDD25"}
      </p>

      <SignOff facebookEventUrl={facebookEventUrl} />
    </>
  );
}

function RejectedContent({
  facebookEventUrl,
}: {
  facebookEventUrl?: string;
}) {
  return (
    <>
      <h1 style={{ fontSize: "24px", margin: "0 0 16px 0", color: "#000000" }}>
        {"Cze\u015B\u0107! \uD83D\uDC4B\uD83D\uDE04"}
      </h1>

      <p style={{ margin: "0 0 16px 0", fontSize: "16px", lineHeight: "1.5", color: "#000000" }}>
        {"Z przykro\u015Bci\u0105 informujemy, \u017Ce "}
        <strong>{"Twoje zg\u0142oszenie nie spe\u0142ni\u0142o naszych kryteri\u00f3w."}</strong>
        {" Konkurencja by\u0142a ogromna, a liczba miejsc ograniczona \uD83D\uDE1E"}
      </p>

      <p style={{ margin: "0 0 16px 0", fontSize: "16px", lineHeight: "1.5", color: "#000000" }}>
        {"Liczymy jednak, \u017Ce nie b\u0119dziesz mia\u0142 nam tego za z\u0142e i mimo wszystko zdecydujesz si\u0119 odwiedzi\u0107 nas w roli widza. B\u0119dzie co ogl\u0105da\u0107, a i atmosfera jak zawsze \uD83D\uDD25"}
      </p>

      <p style={{ margin: "0 0 16px 0", fontSize: "16px", lineHeight: "1.5", color: "#000000" }}>
        {"Trzymamy kciuki za dalszy rozw\u00f3j projektu i "}
        <strong>{"mamy nadziej\u0119 na Twoje zg\u0142oszenie w przysz\u0142ym roku! \uD83D\uDE97\uD83D\uDCAA"}</strong>
      </p>

      <SignOff facebookEventUrl={facebookEventUrl} />
    </>
  );
}
