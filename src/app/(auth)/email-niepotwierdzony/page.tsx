import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MailWarning } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email niepotwierdzony",
};

export default function EmailNotConfirmedPage() {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <MailWarning className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
        <CardTitle className="text-2xl font-heading">
          Email niepotwierdzony
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          Twój adres email nie został jeszcze potwierdzony. Skontaktuj się z
          administratorem, aby uzyskać dostęp do zgłoszeń.
        </p>
      </CardContent>
    </Card>
  );
}
