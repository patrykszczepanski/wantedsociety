"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, LogOut, User, Shield } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Profile } from "@/lib/types";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setProfile(data.user))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setProfile(null);
    window.location.href = "/";
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-brand-black/95 backdrop-blur-sm border-b border-brand-gold/10" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo_profilowe.png"
              alt="Wanted Society"
              width={48}
              height={48}
              className="rounded-full"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth / Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {loading ? null : profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white/80">
                    <User className="w-4 h-4 mr-2" />
                    {profile.full_name || profile.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/zgloszenia">Moje zgłoszenia</Link>
                  </DropdownMenuItem>
                  {profile.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Shield className="w-4 h-4 mr-2" />
                        Panel admina
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Wyloguj się
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" variant="outline">
                <Link href="/logowanie">Zaloguj się</Link>
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-brand-black border-border">
              <SheetTitle className="flex items-center gap-3 mt-2 mb-2">
                <Image src="/logo_profilowe.png" alt="Wanted Society" width={40} height={40} className="rounded-full" />
                <span className="font-heading text-xl text-white tracking-wide">WANTED SOCIETY</span>
              </SheetTitle>
              <nav className="flex flex-col mt-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="font-heading text-lg uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/5 border-l-2 border-transparent hover:border-brand-gold px-4 py-3 transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="border-t border-brand-gold/20 mt-6 pt-6 flex flex-col">
                {profile ? (
                  <>
                    <Link
                      href="/zgloszenia"
                      onClick={() => setMobileOpen(false)}
                      className="font-heading text-lg uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/5 border-l-2 border-transparent hover:border-brand-gold px-4 py-3 transition-all"
                    >
                      Moje zgłoszenia
                    </Link>
                    {profile.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="font-heading text-lg uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/5 border-l-2 border-transparent hover:border-brand-gold px-4 py-3 transition-all"
                      >
                        Panel admina
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="justify-start text-white/50 hover:text-white px-4 py-3"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Wyloguj się
                    </Button>
                  </>
                ) : (
                  <Button asChild className="w-full mt-2 bg-brand-red hover:bg-brand-red/90 text-white font-heading uppercase tracking-wider">
                    <Link
                      href="/logowanie"
                      onClick={() => setMobileOpen(false)}
                    >
                      Zaloguj się
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
