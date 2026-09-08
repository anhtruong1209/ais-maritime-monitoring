"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/providers/locale-provider";

export function StatusBar() {
  // Starts null so the server-rendered markup has no clock value, then
  // picks up the real time on mount — avoids a hydration mismatch.
  const [now, setNow] = useState<Date | null>(null);
  const { t } = useLocale();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="flex h-8 shrink-0 items-center justify-between border-t border-border bg-card px-4 text-[11px] text-muted-foreground">
      <div className="flex items-center gap-4">
        <span>{t("AIS Maritime Monitoring · MVP")}</span>
        <span className="hidden sm:inline">{t("Data source: Supabase (demo dataset)")}</span>
      </div>
      <div className="flex items-center gap-4">
        <span>{t("Region: Vietnam / East Sea")}</span>
        <span suppressHydrationWarning>{now ? now.toUTCString().slice(17, 25) + " UTC" : "—"}</span>
      </div>
    </footer>
  );
}
