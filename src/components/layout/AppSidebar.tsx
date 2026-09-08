"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import { NAV_ITEMS } from "./nav-items";

/** Vertical nav list — used inside the mobile menu Sheet. The desktop nav
 * is a horizontal bar directly in AppHeader instead (see "menu lên top"). */
export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="flex h-full w-56 shrink-0 flex-col gap-1 bg-sidebar p-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={2} />
            {t(label)}
          </Link>
        );
      })}
    </nav>
  );
}
