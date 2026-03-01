import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APPLICATION_TYPES } from "@/lib/constants";
import { ExhibitorForm } from "@/components/applications/exhibitor-form";
import { MediaForm } from "@/components/applications/media-form";
import { PartnerForm } from "@/components/applications/partner-form";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApplicationType, EventEdition } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nowe zgłoszenie",
};

const forms: Record<ApplicationType, React.ComponentType> = {
  exhibitor: ExhibitorForm,
  media: MediaForm,
  partner: PartnerForm,
};

export default async function NewApplicationPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;

  if (!["exhibitor", "media", "partner"].includes(type)) {
    notFound();
  }

  // Check for active edition
  const supabase = createAdminClient();
  const { data: activeEditionData } = await supabase
    .from("event_editions")
    .select("*")
    .eq("applications_open", true)
    .single();

  if (!activeEditionData) {
    redirect("/zgloszenia");
  }

  const activeEdition = activeEditionData as EventEdition;
  const appType = type as ApplicationType;
  const FormComponent = forms[appType];

  return (
    <div className="max-w-2xl mx-auto px-4 py-24">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            Zgłoszenie: {APPLICATION_TYPES[appType]}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Edycja: {activeEdition.name} — {activeEdition.year}
          </p>
        </CardHeader>
        <CardContent>
          <FormComponent />
        </CardContent>
      </Card>
    </div>
  );
}
