"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, PanelLeft, Radar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSidebar } from "@/providers/sidebar-provider";
import { AppSidebar } from "./AppSidebar";

export function AppHeader() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { toggle: toggleSidebar } = useSidebar();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = search.trim();
    router.push(trimmed ? `/vessels?search=${encodeURIComponent(trimmed)}` : "/vessels");
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
      <Sheet>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-56 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AppSidebar />
        </SheetContent>
      </Sheet>

      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <PanelLeft className="size-5" />
      </Button>

      <Link href="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
        <Radar className="size-5 text-primary" strokeWidth={2.2} />
        <span className="hidden sm:inline">AIS Maritime Monitoring</span>
      </Link>

      <form onSubmit={handleSearch} className="ml-auto flex w-full max-w-sm items-center gap-2">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vessel name or MMSI…"
            className="h-9 pl-8"
          />
        </div>
      </form>

      <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
        </span>
        System online
      </div>
    </header>
  );
}
