"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { VesselStatus } from "@/types";

const STATUS_STYLES: Record<VesselStatus, string> = {
  moving: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  anchored: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  stopped: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  offline: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

const STATUS_LABELS: Record<VesselStatus, string> = {
  moving: "Moving",
  anchored: "Anchored",
  stopped: "Stopped",
  offline: "Offline",
};

export function VesselStatusBadge({ status }: { status: VesselStatus }) {
  const { t } = useLocale();
  return (
    <Badge variant="outline" className={cn("font-normal", STATUS_STYLES[status])}>
      {t(STATUS_LABELS[status])}
    </Badge>
  );
}
