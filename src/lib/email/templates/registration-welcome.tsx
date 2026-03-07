import { EmailLayout, SignOff } from "./shared-layout";

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
      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
        <tr>
          <td style={{ padding: "20px", fontSize: "16px", lineHeight: "1.5", color: "#000000" }}>
            <h1 style={{ fontSize: "24px", margin: "0 0 16px 0", color: "#000000" }}>
              {`Cze\u015B\u0107 ${userName}! \uD83D\uDC4B`}
            </h1>

            <p style={{ margin: "0 0 16px 0", fontSize: "16px", lineHeight: "1.5", color: "#000000" }}>
              {"Witamy w Wanted Society! Twoje konto zosta\u0142o pomy\u015Blnie utworzone."}
            </p>

            <p style={{ margin: "0 0 16px 0", fontSize: "16px", lineHeight: "1.5", color: "#000000" }}>
              {"Mo\u017Cesz teraz sk\u0142ada\u0107 zg\u0142oszenia na nasze wydarzenia motoryzacyjne."}
            </p>

            <p style={{ margin: "0 0 16px 0" }}>
              <a
                href={loginUrl}
                style={{ color: "#000000", fontWeight: "bold", textDecoration: "underline" }}
              >
                {"Przejd\u017A do strony"}
              </a>
            </p>

            <SignOff />
          </td>
        </tr>
      </table>
    </EmailLayout>
  );
}
