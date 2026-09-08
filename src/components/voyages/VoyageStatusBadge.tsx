"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { VoyageStatus } from "@/types";

const STATUS_STYLES: Record<VoyageStatus, string> = {
  scheduled: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  in_progress: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};

const STATUS_LABELS: Record<VoyageStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function VoyageStatusBadge({ status }: { status: VoyageStatus }) {
  const { t } = useLocale();
  return (
    <Badge variant="outline" className={cn("font-normal", STATUS_STYLES[status])}>
      {t(STATUS_LABELS[status])}
    </Badge>
  );
}
