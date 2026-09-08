import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AnomalyStatus } from "@/types";

const STATUS_STYLES: Record<AnomalyStatus, string> = {
  open: "bg-red-500/15 text-red-400 border-red-500/30",
  acknowledged: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  resolved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  dismissed: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

export function AnomalyStatusBadge({ status }: { status: AnomalyStatus }) {
  return (
    <Badge variant="outline" className={cn("font-normal capitalize", STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
}
