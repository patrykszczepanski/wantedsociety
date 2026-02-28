"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mediaSchema, type MediaFormData } from "@/lib/validations/application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CabinOption } from "./cabin-option";

export function MediaForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MediaFormData>({
    resolver: zodResolver(mediaSchema),
    defaultValues: { wants_cabin: false },
  });

  async function onSubmit(data: MediaFormData) {
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "media", data }),
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
        <Label htmlFor="instagram_handle">Instagram</Label>
        <Input
          id="instagram_handle"
          placeholder="@twoj_profil"
          {...register("instagram_handle")}
        />
        {errors.instagram_handle && (
          <p className="text-sm text-brand-red">
            {errors.instagram_handle.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolio_url">Portfolio URL (opcjonalne)</Label>
        <Input
          id="portfolio_url"
          placeholder="https://twoje-portfolio.pl"
          {...register("portfolio_url")}
        />
        {errors.portfolio_url && (
          <p className="text-sm text-brand-red">
            {errors.portfolio_url.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience_description">Opis doświadczenia</Label>
        <Textarea
          id="experience_description"
          placeholder="Opisz swoje doświadczenie w fotografii/filmowaniu eventów..."
          rows={4}
          {...register("experience_description")}
        />
        {errors.experience_description && (
          <p className="text-sm text-brand-red">
            {errors.experience_description.message}
          </p>
        )}
      </div>

      <CabinOption
        value={watch("wants_cabin")}
        onChange={(val) => setValue("wants_cabin", val)}
      />

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
