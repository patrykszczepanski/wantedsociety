"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, FileText, Home, Image, ShoppingBag, Users, CalendarDays, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/edycje", label: "Edycje", icon: CalendarDays },
  { href: "/admin/zgloszenia", label: "Zgłoszenia", icon: FileText },
  { href: "/admin/domki", label: "Domki", icon: Home },
  { href: "/admin/poczta", label: "Poczta", icon: Mail },
  { href: "/admin/galeria", label: "Galeria", icon: Image },
  { href: "/admin/sklep", label: "Sklep", icon: ShoppingBag },
  { href: "/admin/uzytkownicy", label: "Użytkownicy", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await fetch("/api/admin/inbox/unread-count");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count || 0);
        }
      } catch {
        // silently ignore
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border min-h-screen p-4 hidden md:block">
      <h2 className="font-heading text-xl font-bold mb-6 px-3">
        Panel <span className="text-brand-red">Admina</span>
      </h2>
      <nav className="space-y-1">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
              {link.href === "/admin/poczta" && unreadCount > 0 && (
                <span className="ml-auto bg-brand-red text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
