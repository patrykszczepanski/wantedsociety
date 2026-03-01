import { Calendar, MapPin } from "lucide-react";
import { AnimateOnScroll } from "@/components/shared/animate-on-scroll";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EventEdition } from "@/lib/types";

export async function EventSection() {
  const supabase = createAdminClient();

  // Try active edition first, then fall back to latest by year
  let edition: EventEdition | null = null;

  const { data: activeEdition } = await supabase
    .from("event_editions")
    .select("*")
    .eq("applications_open", true)
    .single();

  if (activeEdition) {
    edition = activeEdition as EventEdition;
  } else {
    const { data: latestEdition } = await supabase
      .from("event_editions")
      .select("*")
      .order("year", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (latestEdition) {
      edition = latestEdition as EventEdition;
    }
  }

  if (!edition) return null;

  return (
    <section className="relative py-24 bg-gradient-to-b from-brand-black via-[#1a1510] to-brand-black overflow-hidden">
      {/* Grain texture */}
      <div className="absolute inset-0 grain-overlay pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-center mb-2">
            WANTED <span className="text-shimmer-gold">WAVE</span>
          </h2>
          <p className="text-center text-brand-gold/80 font-heading text-xl tracking-[0.3em] mb-4">
            {edition.name.toUpperCase()}
          </p>
          <div className="divider-gold w-24 mx-auto mb-12" />
        </AnimateOnScroll>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <AnimateOnScroll className="animate-delay-100">
            <div className="bg-white/5 border border-brand-gold/15 rounded-xl p-8 backdrop-blur-sm space-y-6">
              {(edition.event_date_display || edition.event_date) && (
                <div className="flex items-center gap-3 text-lg">
                  <Calendar className="w-5 h-5 text-brand-gold" />
                  <span>{edition.event_date_display || edition.event_date}</span>
                </div>
              )}
              {edition.location && (
                <div className="flex items-center gap-3 text-lg">
                  <MapPin className="w-5 h-5 text-brand-gold" />
                  <span>{edition.location}</span>
                </div>
              )}
              {edition.description && (
                <p className="text-white/70 leading-relaxed">
                  {edition.description}
                </p>
              )}
            </div>
          </AnimateOnScroll>

          {edition.instagram_embed_url && (
            <AnimateOnScroll className="animate-delay-200">
              <div className="aspect-[9/16] max-w-sm mx-auto rounded-2xl overflow-hidden bg-brand-black/50 ring-1 ring-brand-gold/20 shadow-[0_0_30px_rgba(255,215,0,0.08)]">
                <iframe
                  src={edition.instagram_embed_url}
                  className="w-full h-full"
                  loading="lazy"
                  title={`Wanted Wave ${edition.name} - Instagram Reel`}
                  allowFullScreen
                />
              </div>
            </AnimateOnScroll>
          )}
        </div>
      </div>
    </section>
  );
}
