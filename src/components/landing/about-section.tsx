"use client";

import { Car, Camera, Handshake } from "lucide-react";
import { AnimateOnScroll } from "@/components/shared/animate-on-scroll";

const features = [
  {
    icon: Car,
    title: "Wystawca",
    description:
      "Pokaż swój projekt na naszym evencie. Stance, fitment, modyfikacje — liczy się pasja i dbałość o detale.",
  },
  {
    icon: Camera,
    title: "Media",
    description:
      "Fotografujesz lub tworzysz content? Dołącz do naszego media crew i uwieczniaj najlepsze momenty.",
  },
  {
    icon: Handshake,
    title: "Partner",
    description:
      "Współpracuj z nami jako partner lub sponsor. Razem tworzymy większe i lepsze eventy.",
  },
];

export function AboutSection() {
  return (
    <section className="relative py-24 bg-brand-black overflow-hidden">
      {/* Subtle gold radial gradient at top */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.03)_0%,transparent_60%)]" />

      {/* Grain texture */}
      <div className="absolute inset-0 grain-overlay pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-center mb-3">
            O <span className="text-brand-gold">NAS</span>
          </h2>
          <div className="divider-gold w-24 mx-auto mb-10" />
        </AnimateOnScroll>

        <AnimateOnScroll className="animate-delay-100">
          <div className="space-y-6 text-lg text-white/70 leading-relaxed max-w-3xl mx-auto text-center mb-16">
            <p>
              <strong className="text-white">Wanted Society</strong> to grupa
              pasjonatów motoryzacji z województwa lubelskiego, tworząca eventy
              łączące miłośników car culture, stance i modyfikacji samochodowych.
            </p>
            <p>
              Organizujemy spotkania, na których liczy się przede wszystkim pasja
              do motoryzacji, dbałość o detale i wspólnota ludzi dzielących te
              same zainteresowania. Nasze eventy to nie tylko wystawy aut — to
              pełne doświadczenie z muzyką, dobrą atmosferą i niezapomnianymi
              wspomnieniami.
            </p>
          </div>
        </AnimateOnScroll>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <AnimateOnScroll
              key={feature.title}
              className={`animate-delay-${(i + 2) * 100}`}
            >
              <div className="group bg-white/5 backdrop-blur-sm border border-brand-gold/10 rounded-xl p-6 text-center transition-all duration-300 hover:border-brand-gold/30 hover:glow-gold">
                <feature.icon className="w-8 h-8 text-brand-gold mx-auto mb-4" />
                <h3 className="font-heading text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
