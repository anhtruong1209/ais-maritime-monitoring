import { Card, CardContent } from "@/components/ui/card";
import { T } from "@/components/shared/T";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accentClassName?: string;
}

export function StatCard({ label, value, icon: Icon, accentClassName }: StatCardProps) {
  return (
    <Card className="gap-2 py-4">
      <CardContent className="flex items-center justify-between px-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            <T>{label}</T>
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        </div>
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-md bg-secondary text-secondary-foreground",
            accentClassName
          )}
        >
          <Icon className="size-4.5" strokeWidth={2} />
        </div>
      </CardContent>
    </Card>
  );
}
