"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/providers/sidebar-provider";
import { NAV_ITEMS } from "./nav-items";

export function AppSidebar() {
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  return (
    <nav
      // Collapsed state comes from localStorage (read via a lazy useState
      // initializer, since it must be known before first paint to avoid a
      // layout flash) — that's client-only, so the server-rendered markup
      // is always "expanded" and can legitimately differ once hydrated.
      suppressHydrationWarning
      className={cn(
        "flex h-full shrink-0 flex-col gap-1 overflow-hidden border-r border-sidebar-border bg-sidebar p-3 transition-[width] duration-200",
        collapsed ? "w-0 border-r-0 p-0" : "w-56"
      )}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
