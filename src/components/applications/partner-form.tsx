"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  partnerSchema,
  type PartnerFormData,
} from "@/lib/validations/application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function PartnerForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
  });

  async function onSubmit(data: PartnerFormData) {
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "partner", data }),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Wystąpił błąd");
      setSubmitting(false);
      return;
    }

    router.push("/zgloszenia");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="company_name">Nazwa firmy</Label>
        <Input
          id="company_name"
          placeholder="Nazwa firmy / marki"
          {...register("company_name")}
        />
        {errors.company_name && (
          <p className="text-sm text-brand-red">
            {errors.company_name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_number">Numer kontaktowy</Label>
        <Input
          id="contact_number"
          placeholder="+48 123 456 789"
          {...register("contact_number")}
        />
        {errors.contact_number && (
          <p className="text-sm text-brand-red">
            {errors.contact_number.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="application_description">Opis współpracy</Label>
        <Textarea
          id="application_description"
          placeholder="Opisz proponowaną współpracę..."
          rows={4}
          {...register("application_description")}
        />
        {errors.application_description && (
          <p className="text-sm text-brand-red">
            {errors.application_description.message}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-brand-red">{error}</p>}

      <Button
        type="submit"
        className="w-full bg-brand-red hover:bg-brand-red/90"
        disabled={submitting}
      >
        {submitting ? "Wysyłanie..." : "Wyślij zgłoszenie"}
      </Button>
    </form>
  );
}
