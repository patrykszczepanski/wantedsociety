"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "nowy";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pricePln, setPricePln] = useState("");
  const [showPrice, setShowPrice] = useState(true);
  const [instagramUrl, setInstagramUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isNew) {
      async function loadProduct() {
        const res = await fetch("/api/admin/products");
        if (res.ok) {
          const products = await res.json();
          const product = products.find((p: { id: string }) => p.id === id);
          if (product) {
            setName(product.name);
            setDescription(product.description || "");
            setPricePln(product.price_pln?.toString() || "");
            setShowPrice(product.show_price);
            setInstagramUrl(product.instagram_contact_url || "");
          }
        }
      }
      loadProduct();
    }
  }, [id, isNew]);

  async function handleSave() {
    setSaving(true);

    const productData = {
      name,
      description: description || null,
      price_pln: pricePln ? parseFloat(pricePln) : null,
      show_price: showPrice,
      instagram_contact_url: instagramUrl || null,
    };

    let productId = id;

    if (isNew) {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (!res.ok) {
        setSaving(false);
        return;
      }
      const data = await res.json();
      productId = data.id;
    } else {
      await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
    }

    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("productId", productId);
      await fetch("/api/admin/products/upload", {
        method: "POST",
        body: formData,
      });
    }

    setSaving(false);
    router.push("/admin/sklep");
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        &larr; Wróć
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            {isNew ? "Nowy produkt" : "Edytuj produkt"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nazwa</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nazwa produktu"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opis produktu"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Cena (PLN)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={pricePln}
              onChange={(e) => setPricePln(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={showPrice} onCheckedChange={setShowPrice} />
            <Label>Pokazuj cenę</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram URL (kontakt)</Label>
            <Input
              id="instagram"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/wanted_society_"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Zdjęcie produktu</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !name}
            className="w-full bg-brand-red hover:bg-brand-red/90"
          >
            {saving ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
