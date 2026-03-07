import {
  Html,
  Head,
  Body,
  Img,
} from "@react-email/components";
import { getPublicStorageUrl } from "@/lib/supabase/storage";
import { INSTAGRAM_URL } from "@/lib/constants";

const LOGO_URL = getPublicStorageUrl("email-assets", "ws-logo-60.png");
const FOOTER_LOGO_URL = getPublicStorageUrl("email-assets", "ws-footer-logo.png");

interface EmailLayoutProps {
  children: React.ReactNode;
  facebookEventUrl?: string;
  showSignOff?: boolean;
}

export function EmailLayout({ children, facebookEventUrl, showSignOff = false }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f4f4f4", margin: 0, padding: 0, fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
        <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: "#f4f4f4" }}>
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellPadding="0" cellSpacing="0" style={{ maxWidth: "600px", width: "100%" }}>
                {/* Header gradient bar with logo */}
                <tr>
                  <td align="center" style={{ background: "linear-gradient(to right, rgb(18, 17, 17), rgb(18, 17, 18))", padding: "10px 0px" }}>
                    <table role="presentation" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td align="center">
                          <Img
                            src={LOGO_URL}
                            width="60"
                            height="60"
                            alt="Wanted Society"
                          />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Content */}
                <tr>
                  <td style={{ backgroundColor: "#ffffff" }}>
                    {children}
                  </td>
                </tr>

                {/* Sign-off section */}
                {showSignOff && (
                  <tr>
                    <td style={{ backgroundColor: "#ffffff", padding: "0 20px 20px 20px", fontSize: "16px", lineHeight: "1.5", color: "#000000" }}>
                      <SignOff facebookEventUrl={facebookEventUrl} />
                    </td>
                  </tr>
                )}

                {/* Footer gradient bar */}
                <tr>
                  <td align="center" style={{ background: "linear-gradient(to right, rgb(18, 17, 17), rgb(18, 17, 18))", padding: "8px 0px" }}>
                    <Img
                      src={FOOTER_LOGO_URL}
                      height="30"
                      alt="Wanted Society"
                    />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </Body>
    </Html>
  );
}

interface SignOffProps {
  facebookEventUrl?: string;
}

export function SignOff({ facebookEventUrl }: SignOffProps) {
  return (
    <>
      <p style={{ margin: "16px 0 4px 0", fontSize: "16px", lineHeight: "1.5", color: "#000000" }}>
        {"Pozdrawiamy,"}<br />
        <strong>{"Zesp\u00f3\u0142 Wanted Society"}</strong>{" \uD83D\uDCA5\uD83D\uDE80"}
      </p>
      <p style={{ margin: "16px 0 4px 0", fontSize: "16px", lineHeight: "1.5" }}>
        <a href={INSTAGRAM_URL} style={{ color: "#000000", fontWeight: "bold", textDecoration: "none" }}>
          {"\uD83D\uDCCD Obserwuj nas na Instagramie"}
        </a>
      </p>
      {facebookEventUrl && (
        <p style={{ margin: "4px 0", fontSize: "16px", lineHeight: "1.5" }}>
          <a href={facebookEventUrl} style={{ color: "#000000", fontWeight: "bold", textDecoration: "none" }}>
            {"\uD83D\uDCCD \u015Aled\u017A wydarzenie"}
          </a>
        </p>
      )}
    </>
  );
}
