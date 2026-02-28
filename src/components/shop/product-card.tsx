"use client";

import Image from "next/image";
import { getPublicStorageUrl } from "@/lib/supabase/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram } from "lucide-react";
import { INSTAGRAM_URL } from "@/lib/constants";
import type { Product, ProductImage } from "@/lib/types";

interface ProductCardProps {
  product: Product & { product_images: ProductImage[] };
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage =
    product.product_images.find((img) => img.is_primary) ||
    product.product_images[0];

  const imageUrl = primaryImage
    ? getPublicStorageUrl("products", primaryImage.storage_path)
    : "";

  const contactUrl = product.instagram_contact_url || INSTAGRAM_URL;

  return (
    <Card className="overflow-hidden group">
      <div className="aspect-square relative bg-secondary">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Brak zdjęcia
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-heading text-lg font-bold">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}
        {product.show_price && product.price_pln ? (
          <p className="text-brand-gold font-bold text-lg">
            {Number(product.price_pln).toFixed(2)} PLN
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">Zapytaj o cenę</p>
        )}
        <Button asChild className="w-full bg-brand-red hover:bg-brand-red/90">
          <a href={contactUrl} target="_blank" rel="noopener noreferrer">
            <Instagram className="w-4 h-4 mr-2" />
            Napisz na Instagram
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
