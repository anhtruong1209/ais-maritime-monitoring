"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import { AppSidebar } from "./AppSidebar";
import { NAV_ITEMS } from "./nav-items";

// No search box here — it duplicated the Vessels page's own search (and,
// on /map, the map's own search-with-autocomplete) without adding
// anything, just two "Search vessel..." boxes stacked on top of each
// other. One search per page, where it's actually useful, instead.
export function AppHeader() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card px-4">
      <Sheet>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-56 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AppSidebar />
        </SheetContent>
      </Sheet>

      <Link href="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
        <Radar className="size-5 text-primary" strokeWidth={2.2} />
        <span className="hidden sm:inline">AIS Maritime Monitoring</span>
      </Link>

      <nav className="hidden items-center gap-1 md:flex">
        {NAV_ITEMS.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              {t(label)}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center overflow-hidden rounded-md border border-border text-xs font-medium">
        <button
          type="button"
          onClick={() => setLocale("vi")}
          className={cn(
            "px-2 py-1",
            locale === "vi" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
          )}
        >
          VI
        </button>
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={cn(
            "px-2 py-1",
            locale === "en" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
          )}
        >
          EN
        </button>
      </div>

      <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
        </span>
        {t("System online")}
      </div>
    </header>
  );
}
