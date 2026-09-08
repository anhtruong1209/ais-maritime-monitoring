import { SHIP_TYPE_COLORS, SHIP_TYPE_LABELS } from "@/lib/map/ship-type-meta";
import type { ShipType } from "@/types";

const ORDER: ShipType[] = ["cargo", "tanker", "passenger", "fishing", "tug", "military", "other"];

export function MapLegend() {
  return (
    <div className="rounded-md border border-border bg-card/95 p-3 text-sm shadow-lg backdrop-blur">
      <p className="mb-2 font-semibold text-muted-foreground">Vessel Type</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {ORDER.map((type) => (
          <div key={type} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: SHIP_TYPE_COLORS[type] }}
            />
            {SHIP_TYPE_LABELS[type]}
          </div>
        ))}
      </div>
    </div>
  );
}
