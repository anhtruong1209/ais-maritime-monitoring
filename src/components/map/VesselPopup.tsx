"use client";

import { Button } from "@/components/ui/button";
import { VesselStatusBadge } from "@/components/vessels/VesselStatusBadge";
import { formatCog, formatCoordinate, formatRelativeTime, formatSog } from "@/lib/format";
import { SHIP_TYPE_LABELS } from "@/lib/map/ship-type-meta";
import { useLocale } from "@/providers/locale-provider";
import { useVesselDetailDialog } from "@/providers/vessel-detail-provider";
import type { VesselWithLatestPosition } from "@/types";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

/** MarineTraffic-style summary card shown when a vessel marker is clicked. */
export function VesselPopupContent({ vessel }: { vessel: VesselWithLatestPosition }) {
  const pos = vessel.latestPosition;
  const { openVessel } = useVesselDetailDialog();
  const { t } = useLocale();

  return (
    <div className="w-56 space-y-2 text-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="text-base leading-tight font-semibold">{vessel.name}</span>
        <VesselStatusBadge status={vessel.status} />
      </div>

      <dl className="grid grid-cols-2 gap-x-2 gap-y-1.5">
        <Field label="MMSI" value={vessel.mmsi} />
        <Field label="IMO" value={vessel.imo ?? "—"} />
        <Field label={t("Flag")} value={vessel.flag} />
        <Field label={t("Call Sign")} value={vessel.callSign ?? "—"} />
        <Field label={t("Type")} value={t(SHIP_TYPE_LABELS[vessel.shipType])} />
        <Field label={t("Nav Status")} value={pos?.navStatus ?? "—"} />
      </dl>

      {pos && (
        <dl className="grid grid-cols-2 gap-x-2 gap-y-1.5 border-t border-border pt-2">
          <Field label={t("Speed")} value={formatSog(pos.sog)} />
          <Field label={t("Course")} value={formatCog(pos.cog)} />
          <Field label={t("Latitude")} value={formatCoordinate(pos.latitude, "lat")} />
          <Field label={t("Longitude")} value={formatCoordinate(pos.longitude, "lon")} />
          <Field label={t("Destination")} value={pos.destination ?? "—"} />
          <Field label={t("Last Report")} value={formatRelativeTime(pos.timestamp)} />
        </dl>
      )}

      <Button size="sm" className="w-full" onClick={() => openVessel(vessel.mmsi)}>
        {t("Chi tiết / View Details")}
      </Button>
    </div>
  );
}
