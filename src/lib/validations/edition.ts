import { z } from "zod";

export const editionSchema = z.object({
  name: z.string().min(2, "Nazwa edycji musi mieć min. 2 znaki"),
  year: z.coerce.number().int().min(2020, "Rok musi być >= 2020").max(2100, "Rok musi być <= 2100"),
  event_date: z.string().nullable().optional(),
  event_date_display: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  instagram_embed_url: z.string().url("Nieprawidłowy URL").nullable().optional().or(z.literal("")),
  facebook_event_url: z.string().url("Nieprawidłowy URL").nullable().optional().or(z.literal("")),
  applications_open: z.boolean().optional(),
});

export type EditionFormData = z.infer<typeof editionSchema>;
