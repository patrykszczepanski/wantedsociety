"use client";

import Image from "next/image";
import { getPublicStorageUrl } from "@/lib/supabase/storage";

interface ApplicationPhotosProps {
  paths: string[];
}

export function ApplicationPhotos({ paths }: ApplicationPhotosProps) {
  if (!paths || paths.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Zdjęcia</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {paths.map((path) => (
          <a
            key={path}
            href={getPublicStorageUrl("application-photos", path)}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square rounded-lg overflow-hidden group"
          >
            <Image
              src={getPublicStorageUrl("application-photos", path)}
              alt="Zdjęcie zgłoszenia"
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
