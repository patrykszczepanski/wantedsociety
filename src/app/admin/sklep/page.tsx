"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getPublicStorageUrl } from "@/lib/supabase/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Pencil } from "lucide-react";
import type { Product } from "@/lib/types";

export default function AdminShopPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data || []);
    }
  }

  async function togglePublished(product: Product) {
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !product.is_published }),
    });
    await loadProducts();
  }

  async function deleteProduct(product: Product) {
    if (!confirm(`Usunąć "${product.name}"?`)) return;
    await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    await loadProducts();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold">Sklep</h1>
        <Button asChild className="bg-brand-red hover:bg-brand-red/90">
          <Link href="/admin/sklep/nowy">
            <Plus className="w-4 h-4 mr-2" />
            Dodaj produkt
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const images = (product as Product & { product_images: Array<{ storage_path: string; is_primary: boolean }> }).product_images || [];
          const primaryImage = images.find((img) => img.is_primary) || images[0];
          const imageUrl = primaryImage
            ? getPublicStorageUrl("products", primaryImage.storage_path)
            : "";

          return (
            <Card
              key={product.id}
              className={`overflow-hidden ${!product.is_published ? "opacity-50" : ""}`}
            >
              <div className="aspect-square relative bg-secondary">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Brak zdjęcia
                  </div>
                )}
              </div>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-heading font-bold">{product.name}</h3>
                {product.show_price && product.price_pln && (
                  <p className="text-brand-gold font-bold">
                    {Number(product.price_pln).toFixed(2)} PLN
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={product.is_published}
                      onCheckedChange={() => togglePublished(product)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {product.is_published ? "Widoczne" : "Ukryte"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/sklep/${product.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteProduct(product)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
