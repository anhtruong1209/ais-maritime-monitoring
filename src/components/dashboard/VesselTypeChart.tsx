"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SHIP_TYPE_COLORS, SHIP_TYPE_LABELS } from "@/lib/map/ship-type-meta";
import { useLocale } from "@/providers/locale-provider";
import type { ShipType } from "@/types";

export function VesselTypeChart({ byShipType }: { byShipType: Record<ShipType, number> }) {
  const { t } = useLocale();
  const data = (Object.keys(SHIP_TYPE_LABELS) as ShipType[])
    .map((type) => ({ type, label: t(SHIP_TYPE_LABELS[type]), count: byShipType[type] ?? 0 }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          stroke="var(--muted-foreground)"
          fontSize={11}
          width={70}
        />
        <Tooltip
          cursor={{ fill: "var(--secondary)" }}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--popover-foreground)",
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((d) => (
            <Cell key={d.type} fill={SHIP_TYPE_COLORS[d.type]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
