"use client";

import { useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SeverityBadge } from "@/components/alerts/SeverityBadge";
import { useAllVesselsForMap } from "@/hooks/use-vessels";
import { assessCollisionRisk, calculateCpaTcpa, type CollisionRiskAssessment } from "@/lib/collision";
import { COLLISION_NEARBY_RADIUS_KM } from "@/lib/constants";
import { haversineDistanceKm } from "@/lib/geo";
import { useLocale } from "@/providers/locale-provider";
import { useVesselDetailDialog } from "@/providers/vessel-detail-provider";
import type { VesselWithLatestPosition } from "@/types";

interface LatestPosition {
  latitude: number;
  longitude: number;
  sog: number;
  cog: number;
}

interface CollisionCandidate {
  vessel: VesselWithLatestPosition;
  assessment: CollisionRiskAssessment;
}

/**
 * Deterministic CPA/TCPA collision-risk baseline for the selected vessel.
 * Lists every other vessel within COLLISION_NEARBY_RADIUS_KM (sorted by
 * risk) in a picker, defaulting to the tightest predicted approach, and
 * shows that pair's CPA/TCPA — this is the non-AI baseline the Phase 2
 * architecture audit calls for, labeled distinctly from the AI trajectory/
 * ETA cards above it (it isn't a model, and isn't meant to be replaced by
 * one outright — see lib/collision.ts).
 *
 * The picked "other" vessel is shared via VesselDetailProvider
 * (collisionCompareMmsi), the same way historyHours/predictionHorizonMinutes
 * are, so the /map page can draw both vessels' predicted paths to their
 * CPA point on the actual map instead of this panel needing its own one.
 *
 * Nothing is fetched/computed until the user clicks "Check" — scanning the
 * whole fleet for nearby vessels is comparatively heavy (a ~1500-row
 * payload), so unlike the other AI/prediction cards this one doesn't run
 * automatically just because the detail panel opened.
 */
export function CollisionRiskCard({
  vesselId,
  latest,
}: {
  vesselId: string;
  latest: LatestPosition | null;
}) {
  const { t, locale } = useLocale();
  const { collisionRiskRequested, requestCollisionRisk, collisionCompareMmsi, setCollisionCompareMmsi } =
    useVesselDetailDialog();
  const { data: fleetResponse, isLoading } = useAllVesselsForMap(
    {},
    { enabled: collisionRiskRequested }
  );

  const candidates = useMemo<CollisionCandidate[]>(() => {
    if (!latest) return [];
    return (fleetResponse?.data ?? [])
      .filter(
        (other): other is VesselWithLatestPosition & { latestPosition: NonNullable<VesselWithLatestPosition["latestPosition"]> } =>
          other.id !== vesselId &&
          other.latestPosition != null &&
          haversineDistanceKm(latest, other.latestPosition) <= COLLISION_NEARBY_RADIUS_KM
      )
      .map((other) => ({
        vessel: other,
        assessment: assessCollisionRisk(
          calculateCpaTcpa(latest, {
            latitude: other.latestPosition.latitude,
            longitude: other.latestPosition.longitude,
            sog: other.latestPosition.sog,
            cog: other.latestPosition.cog,
          })
        ),
      }))
      .sort((a, b) => b.assessment.riskScore - a.assessment.riskScore);
  }, [latest, fleetResponse, vesselId]);

  // Default to the highest-risk nearby vessel, but only until the user
  // (or a previous render of this same panel) has actually picked one —
  // openVessel()/closeVessel() reset collisionCompareMmsi to null on
  // vessel change, so this re-defaults for each newly opened vessel.
  useEffect(() => {
    if (collisionCompareMmsi == null && candidates.length > 0) {
      setCollisionCompareMmsi(candidates[0].vessel.mmsi);
    }
  }, [candidates, collisionCompareMmsi, setCollisionCompareMmsi]);

  if (!latest) {
    return null;
  }

  const selected =
    candidates.find((c) => c.vessel.mmsi === collisionCompareMmsi) ?? candidates[0] ?? null;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{t("Collision Risk")}</CardTitle>
        <Badge variant="outline" className="border-sky-500/40 text-sky-400">
          {t("CPA/TCPA BASELINE — NOT AI")}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {!collisionRiskRequested ? (
          <>
            <p className="text-sm text-muted-foreground">
              {t("Scans nearby vessels' AIS data to check CPA/TCPA — not run automatically.")}
            </p>
            <Button variant="outline" size="sm" onClick={requestCollisionRisk}>
              {t("Check collision risk")}
            </Button>
          </>
        ) : isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("No other vessels nearby to compare against.")}
          </p>
        ) : (
          <>
            <Select value={selected?.vessel.mmsi} onValueChange={setCollisionCompareMmsi}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder={t("Compare against…")}>
                  {(mmsi: string) => candidates.find((c) => c.vessel.mmsi === mmsi)?.vessel.name ?? mmsi}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {candidates.map((c) => (
                  <SelectItem key={c.vessel.mmsi} value={c.vessel.mmsi}>
                    {c.vessel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selected && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{selected.vessel.name}</span>
                  <SeverityBadge severity={selected.assessment.riskLevel} />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">CPA</p>
                    <p className="text-sm font-medium tabular-nums">
                      {selected.assessment.cpaKm.toFixed(2)} km
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">TCPA</p>
                    <p className="text-sm font-medium tabular-nums">
                      {selected.assessment.tcpaMinutes != null
                        ? `${Math.round(selected.assessment.tcpaMinutes)} ${t("min")}`
                        : "—"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selected.assessment.tcpaMinutes != null
                    ? locale === "vi"
                      ? `Dự kiến khoảng cách gần nhất ${selected.assessment.cpaKm.toFixed(2)} km sau ${Math.round(selected.assessment.tcpaMinutes)} phút nếu cả hai tàu giữ nguyên tốc độ/hướng đi hiện tại.`
                      : `Predicted closest approach of ${selected.assessment.cpaKm.toFixed(2)} km in ${Math.round(selected.assessment.tcpaMinutes)} min if both vessels hold their current speed/course.`
                    : t("Not on a closing course at current speed/heading.")}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
