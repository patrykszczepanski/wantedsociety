"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  exhibitorSchema,
  type ExhibitorFormData,
} from "@/lib/validations/application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PhotoUpload } from "./photo-upload";
import { CabinOption } from "./cabin-option";

export function ExhibitorForm() {
  const [photoPaths, setPhotoPaths] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExhibitorFormData>({
    resolver: zodResolver(exhibitorSchema),
    defaultValues: { photo_paths: [], wants_cabin: false },
  });

  async function onSubmit(data: ExhibitorFormData) {
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "exhibitor",
        data: { ...data, photo_paths: photoPaths },
      }),
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
        <Label htmlFor="car_name">Nazwa samochodu</Label>
        <Input
          id="car_name"
          placeholder="np. BMW E36 328i"
          {...register("car_name")}
        />
        {errors.car_name && (
          <p className="text-sm text-brand-red">{errors.car_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="modification_description">Opis modyfikacji</Label>
        <Textarea
          id="modification_description"
          placeholder="Opisz modyfikacje swojego samochodu..."
          rows={4}
          {...register("modification_description")}
        />
        {errors.modification_description && (
          <p className="text-sm text-brand-red">
            {errors.modification_description.message}
          </p>
        )}
      </div>

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
        <Label>Zdjęcia samochodu (max 10)</Label>
        <PhotoUpload
          onPhotosChange={(paths) => {
            setPhotoPaths(paths);
            setValue("photo_paths", paths, { shouldValidate: true });
          }}
          maxFiles={10}
        />
        {errors.photo_paths && (
          <p className="text-sm text-brand-red">{errors.photo_paths.message}</p>
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
        disabled={submitting || photoPaths.length === 0}
      >
        {submitting ? "Wysyłanie..." : "Wyślij zgłoszenie"}
      </Button>
    </form>
  );
}
