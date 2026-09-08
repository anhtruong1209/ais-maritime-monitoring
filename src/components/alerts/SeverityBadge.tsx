"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { AnomalySeverity } from "@/types";

const SEVERITY_STYLES: Record<AnomalySeverity, string> = {
  low: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function SeverityBadge({ severity }: { severity: AnomalySeverity }) {
  const { t } = useLocale();
  return (
    <Badge variant="outline" className={cn("font-normal capitalize", SEVERITY_STYLES[severity])}>
      {t(severity)}
    </Badge>
  );
}
