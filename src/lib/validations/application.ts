import { z } from "zod";

export const exhibitorSchema = z.object({
  car_name: z.string().min(2, "Nazwa samochodu musi mieć min. 2 znaki"),
  license_plate: z.string().min(2, "Numer rejestracyjny musi mieć min. 2 znaki"),
  modification_description: z
    .string()
    .min(10, "Opis modyfikacji musi mieć min. 10 znaków"),
  instagram_handle: z
    .string()
    .regex(/^@?[\w.]+$/, "Nieprawidłowy format Instagram handle"),
  photo_paths: z
    .array(z.string())
    .min(1, "Dodaj przynajmniej 1 zdjęcie")
    .max(10, "Maksymalnie 10 zdjęć"),
  wants_cabin: z.boolean(),
});

export const mediaSchema = z.object({
  instagram_handle: z
    .string()
    .regex(/^@?[\w.]+$/, "Nieprawidłowy format Instagram handle"),
  portfolio_url: z.string().url("Nieprawidłowy URL").optional().or(z.literal("")),
  experience_description: z
    .string()
    .min(10, "Opis doświadczenia musi mieć min. 10 znaków"),
  wants_cabin: z.boolean(),
});

export const partnerSchema = z.object({
  contact_number: z.string().min(9, "Numer kontaktowy musi mieć min. 9 znaków"),
  company_name: z.string().min(2, "Nazwa firmy musi mieć min. 2 znaki"),
  application_description: z
    .string()
    .min(10, "Opis zgłoszenia musi mieć min. 10 znaków"),
});

export const messageSchema = z.object({
  content: z.string().min(1, "Wiadomość nie może być pusta"),
});

export type ExhibitorFormData = z.infer<typeof exhibitorSchema>;
export type MediaFormData = z.infer<typeof mediaSchema>;
export type PartnerFormData = z.infer<typeof partnerSchema>;
