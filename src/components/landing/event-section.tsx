"use client";

import { Calendar, MapPin } from "lucide-react";
import { AnimateOnScroll } from "@/components/shared/animate-on-scroll";

export function EventSection() {
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
            SUMMER CORE
          </p>
          <div className="divider-gold w-24 mx-auto mb-12" />
        </AnimateOnScroll>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <AnimateOnScroll className="animate-delay-100">
            <div className="bg-white/5 border border-brand-gold/15 rounded-xl p-8 backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-3 text-lg">
                <Calendar className="w-5 h-5 text-brand-gold" />
                <span>22 czerwca 2025</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <MapPin className="w-5 h-5 text-brand-gold" />
                <span>Resort Piaseczno</span>
              </div>
              <p className="text-white/70 leading-relaxed">
                Wanted Wave Summer Core to nasz flagowy event sezonu letniego.
                Wystawa najlepszych aut ze sceny stance i fitment, muzyka,
                food trucki i niezapomniana atmosfera nad wodą. Nie przegap tego!
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll className="animate-delay-200">
            <div className="aspect-[9/16] max-w-sm mx-auto rounded-2xl overflow-hidden bg-brand-black/50 ring-1 ring-brand-gold/20 shadow-[0_0_30px_rgba(255,215,0,0.08)]">
              <iframe
                src="https://www.instagram.com/reel/DLX9wO7ibZR/embed"
                className="w-full h-full"
                loading="lazy"
                title="Wanted Wave Summer Core - Instagram Reel"
                allowFullScreen
              />
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
