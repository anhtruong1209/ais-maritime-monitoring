"use client";

import { Badge } from "@/components/ui/badge";
import { SHIP_TYPE_COLORS, SHIP_TYPE_LABELS } from "@/lib/map/ship-type-meta";
import { useLocale } from "@/providers/locale-provider";
import type { ShipType } from "@/types";

export function ShipTypeBadge({ shipType }: { shipType: ShipType }) {
  const { t } = useLocale();
  return (
    <Badge
      variant="outline"
      className="gap-1.5 font-normal"
      style={{ borderColor: SHIP_TYPE_COLORS[shipType] }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: SHIP_TYPE_COLORS[shipType] }}
      />
      {t(SHIP_TYPE_LABELS[shipType])}
    </Badge>
  );
}
