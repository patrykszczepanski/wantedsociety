import { EmailLayout, SignOff } from "./shared-layout";

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
    <EmailLayout>
      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
        <tr>
          <td style={{ padding: "20px", fontSize: "16px", lineHeight: "1.5", color: "#000000" }}>
            <h1 style={{ fontSize: "24px", margin: "0 0 16px 0", color: "#000000" }}>
              {`Cze\u015B\u0107 ${userName}! \uD83D\uDC4B`}
            </h1>

            <p style={{ margin: "0 0 16px 0", fontSize: "16px", lineHeight: "1.5", color: "#000000" }}>
              {"Twoje zg\u0142oszenie typu "}
              <strong>{applicationType}</strong>
              {" na edycj\u0119 "}
              <strong>{editionName}</strong>
              {" zosta\u0142o przyj\u0119te i oczekuje na rozpatrzenie."}
            </p>

            <p style={{ margin: "0 0 16px 0", fontSize: "16px", lineHeight: "1.5", color: "#000000" }}>
              {"Poinformujemy Ci\u0119 o decyzji mailowo. Mo\u017Cesz te\u017C \u015Bledzi\u0107 status na stronie:"}
            </p>

            <p style={{ margin: "0 0 16px 0" }}>
              <a
                href={applicationUrl}
                style={{ color: "#000000", fontWeight: "bold", textDecoration: "underline" }}
              >
                {"Zobacz zg\u0142oszenie"}
              </a>
            </p>

            <SignOff />
          </td>
        </tr>
      </table>
    </EmailLayout>
  );
}
