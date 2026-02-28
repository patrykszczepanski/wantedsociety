import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { INSTAGRAM_URL, FACEBOOK_URL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-black">
      <div className="divider-gold" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo_profilowe.png"
              alt="Wanted Society"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-heading text-xl font-bold">
              WANTED <span className="text-brand-red">SOCIETY</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-brand-gold transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-brand-gold transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>

          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Wanted Society. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  );
}
