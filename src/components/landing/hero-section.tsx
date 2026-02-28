import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Layer 1: Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Layer 2: Gradient overlay - heavy at bottom for smooth transition */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/70 to-brand-black/30" />

      {/* Layer 3: Vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(26,26,26,0.6) 100%)",
        }}
      />

      {/* Layer 4: Grain texture */}
      <div className="absolute inset-0 grain-overlay pointer-events-none" />

      {/* Layer 5: Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center animate-fade-in">
        <Image
          src="/logo_profilowe.png"
          alt="Wanted Society"
          width={180}
          height={180}
          className="rounded-full shadow-[0_0_40px_rgba(255,215,0,0.15)] ring-1 ring-brand-gold/20 animate-scale-in"
          priority
        />

        <div>
          <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight">
            WANTED{" "}
            <span className="text-shimmer-gold">SOCIETY</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/60 tracking-[0.3em] uppercase font-light">
            Stance meets &bull; Car culture &bull; Lublin
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="bg-gradient-to-r from-brand-gold-deep via-brand-gold to-brand-gold-amber text-brand-black font-bold text-lg px-10 py-6 hover:brightness-110 transition-all animate-pulse-gold"
        >
          <Link href="/zgloszenia">Zgłoś się</Link>
        </Button>
      </div>

      {/* Layer 6: Bottom wave SVG for smooth transition to About */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          preserveAspectRatio="none"
        >
          <path
            d="M0,80 C360,120 720,40 1080,80 C1260,100 1380,90 1440,80 L1440,120 L0,120 Z"
            fill="#1A1A1A"
          />
        </svg>
      </div>
    </section>
  );
}
