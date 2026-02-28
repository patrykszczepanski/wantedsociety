"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getPublicStorageUrl } from "@/lib/supabase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Upload } from "lucide-react";
import type { GalleryItem } from "@/lib/types";

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const res = await fetch("/api/admin/gallery");
    if (res.ok) {
      const data = await res.json();
      setItems(data || []);
    }
  }

  async function handleUpload(files: FileList) {
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/admin/gallery/upload", {
        method: "POST",
        body: formData,
      });

      if (uploadRes.ok) {
        const { path, mediaType } = await uploadRes.json();
        await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storage_path: path,
            media_type: mediaType,
            title: file.name.split(".").slice(0, -1).join("."),
            sort_order: items.length,
          }),
        });
      }
    }

    await loadItems();
    setUploading(false);
  }

  async function togglePublished(item: GalleryItem) {
    await fetch(`/api/admin/gallery/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !item.is_published }),
    });
    await loadItems();
  }

  async function deleteItem(item: GalleryItem) {
    if (!confirm("Usunąć ten element?")) return;
    await fetch(`/api/admin/gallery/${item.id}`, { method: "DELETE" });
    await loadItems();
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-8">Galeria</h1>

      <div className="mb-8">
        <Label
          htmlFor="gallery-upload"
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-brand-red hover:bg-brand-red/90 text-white rounded-md transition-colors"
        >
          <Upload className="w-4 h-4" />
          {uploading ? "Wysyłanie..." : "Dodaj zdjęcia / video"}
        </Label>
        <Input
          id="gallery-upload"
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const url = getPublicStorageUrl("gallery", item.storage_path);

          return (
            <Card
              key={item.id}
              className={`overflow-hidden ${!item.is_published ? "opacity-50" : ""}`}
            >
              <div className="aspect-square relative">
                {item.media_type === "image" ? (
                  <Image
                    src={url}
                    alt={item.title || ""}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <video src={url} className="w-full h-full object-cover" />
                )}
              </div>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.is_published}
                    onCheckedChange={() => togglePublished(item)}
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.is_published ? "Widoczne" : "Ukryte"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteItem(item)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
