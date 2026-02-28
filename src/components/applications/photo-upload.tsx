"use client";

import { useCallback, useState } from "react";
import { Upload, X } from "lucide-react";

interface PhotoUploadProps {
  onPhotosChange: (paths: string[]) => void;
  maxFiles?: number;
}

interface UploadedFile {
  path: string;
  name: string;
  previewUrl: string;
  progress: number;
}

export function PhotoUpload({ onPhotosChange, maxFiles = 10 }: PhotoUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      const validFiles = Array.from(fileList).filter((f) => {
        if (!f.type.startsWith("image/")) return false;
        if (f.size > 20 * 1024 * 1024) return false;
        return true;
      });

      if (files.length + validFiles.length > maxFiles) {
        alert(`Maksymalnie ${maxFiles} zdjęć`);
        return;
      }

      setUploading(true);
      setError(null);
      const newFiles: UploadedFile[] = [];
      let failedCount = 0;

      for (const file of validFiles) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch("/api/applications/upload", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const { path } = await res.json();
            newFiles.push({
              path,
              name: file.name,
              previewUrl: URL.createObjectURL(file),
              progress: 100,
            });
          } else {
            failedCount++;
          }
        } catch {
          failedCount++;
        }
      }

      if (failedCount > 0) {
        setError(
          `Nie udało się przesłać ${failedCount} ${failedCount === 1 ? "pliku" : "plików"}. Spróbuj ponownie.`
        );
      }

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onPhotosChange(updatedFiles.map((f) => f.path));
      setUploading(false);
    },
    [files, maxFiles, onPhotosChange]
  );

  function removeFile(index: number) {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onPhotosChange(updated.map((f) => f.path));
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragOver
            ? "border-brand-red bg-brand-red/5"
            : "border-border hover:border-brand-red/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.multiple = true;
          input.accept = "image/*";
          input.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files) handleFiles(target.files);
          };
          input.click();
        }}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {uploading
            ? "Wysyłanie..."
            : "Przeciągnij zdjęcia lub kliknij, aby wybrać"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Max {maxFiles} plików, do 20MB każdy
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {files.map((file, i) => (
            <div key={file.path} className="relative aspect-square rounded-lg overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={file.previewUrl}
                alt={file.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
