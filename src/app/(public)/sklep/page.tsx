import { createAdminClient } from "@/lib/supabase/admin";
import { ProductCard } from "@/components/shop/product-card";
import type { Product, ProductImage } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sklep",
};

export default async function ShopPage() {
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-7xl mx-auto px-4 py-24">
      <h1 className="font-heading text-4xl sm:text-5xl font-bold text-center mb-12">
        <span className="text-brand-red">SKLEP</span>
      </h1>

      {(!products || products.length === 0) ? (
        <p className="text-center text-muted-foreground py-12">
          Brak produktów w sklepie. Wkrótce coś dodamy!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(products as (Product & { product_images: ProductImage[] })[]).map(
            (product) => (
              <ProductCard key={product.id} product={product} />
            )
          )}
        </div>
      )}
    </div>
  );
}
