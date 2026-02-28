"use client";

import { useEffect, useState } from "react";
import { Home } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { CabinSettings } from "@/lib/types";

interface CabinOptionProps {
  value: boolean;
  onChange: (val: boolean) => void;
  error?: string;
}

export function CabinOption({ value, onChange, error }: CabinOptionProps) {
  const [settings, setSettings] = useState<CabinSettings | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/settings/cabin");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    }
    load();
  }, []);

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Home className="w-5 h-5 text-brand-gold" />
        <span className="font-heading font-bold text-lg">
          Domek na evencie
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="wants_cabin"
          checked={value}
          onCheckedChange={onChange}
        />
        <Label htmlFor="wants_cabin" className="cursor-pointer">
          Chcę zarezerwować domek
        </Label>
      </div>

      {settings && (
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            Cena: <span className="text-white font-medium">{settings.cabin_price_pln} PLN</span>
          </p>
          <p>{settings.cabin_payment_deadline_message}</p>
        </div>
      )}

      {error && <p className="text-sm text-brand-red">{error}</p>}
    </div>
  );
}
