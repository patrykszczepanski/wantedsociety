import { EmailLayout, SignOff } from "./shared-layout";

interface NewMessageEmailProps {
  recipientName: string;
  senderName: string;
  messagePreview: string;
  applicationUrl: string;
}

export function NewMessageEmail({
  recipientName,
  senderName,
  messagePreview,
  applicationUrl,
}: NewMessageEmailProps) {
  return (
    <EmailLayout>
      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
        <tr>
          <td style={{ padding: "20px", fontSize: "16px", lineHeight: "1.5", color: "#000000" }}>
            <h1 style={{ fontSize: "24px", margin: "0 0 16px 0", color: "#000000" }}>
              {`Cze\u015B\u0107 ${recipientName}! \uD83D\uDC4B`}
            </h1>

            <p style={{ margin: "0 0 16px 0", fontSize: "16px", lineHeight: "1.5", color: "#000000" }}>
              {"Masz now\u0105 wiadomo\u015B\u0107 od "}
              <strong>{senderName}</strong>
              {":"}
            </p>

            <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ margin: "0 0 16px 0" }}>
              <tr>
                <td style={{ padding: "12px 16px", backgroundColor: "#f4f4f4", borderLeft: "4px solid #000000", fontSize: "16px", lineHeight: "1.5", color: "#333333" }}>
                  {messagePreview}
                </td>
              </tr>
            </table>

            <p style={{ margin: "0 0 16px 0" }}>
              <a
                href={applicationUrl}
                style={{ color: "#000000", fontWeight: "bold", textDecoration: "underline" }}
              >
                {"Zobacz konwersacj\u0119"}
              </a>
            </p>

            <SignOff />
          </td>
        </tr>
      </table>
    </EmailLayout>
  );
}
