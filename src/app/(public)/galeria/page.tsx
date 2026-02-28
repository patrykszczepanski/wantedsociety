import { createAdminClient } from "@/lib/supabase/admin";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import type { GalleryItem } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeria",
};

export default async function GalleryPage() {
  const supabase = createAdminClient();
  const { data: items } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-7xl mx-auto px-4 py-24">
      <h1 className="font-heading text-4xl sm:text-5xl font-bold text-center mb-12">
        <span className="text-brand-red">GALERIA</span>
      </h1>

      {(!items || items.length === 0) ? (
        <p className="text-center text-muted-foreground py-12">
          Galeria jest jeszcze pusta. Wkrótce dodamy zdjęcia z naszych eventów!
        </p>
      ) : (
        <GalleryGrid items={items as GalleryItem[]} />
      )}
    </div>
  );
}
