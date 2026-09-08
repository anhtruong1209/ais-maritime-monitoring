"use client";

import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVesselPositions } from "@/hooks/use-vessel-positions";
import { TRAJECTORY_WINDOW_OPTIONS } from "@/lib/constants";
import { formatTime } from "@/lib/format";
import { interpolateTrackPosition } from "@/lib/map/playback";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import { useVesselDetailDialog } from "@/providers/vessel-detail-provider";

/**
 * The trajectory-window picker, plus — once a window is actually picked —
 * playback transport controls (play/pause + a scrub timeline) for
 * replaying the vessel's movement over that window. Playback is entirely
 * client-side over positions already loaded here (see
 * interpolateTrackPosition): scrubbing/playing never fetches anything,
 * and the moving marker itself is drawn by /map (PlaybackMarker), which
 * reads the same shared progress from VesselDetailProvider.
 */
export function VesselHistoryPanel({ mmsi }: { mmsi: string }) {
  const {
    historyHours,
    historyRequested,
    historyVesselMmsi,
    setHistoryHours,
    playbackProgress,
    setPlaybackProgress,
    playbackPlaying,
    togglePlayback,
  } = useVesselDetailDialog();
  const { t } = useLocale();

  const active = historyRequested && historyVesselMmsi === mmsi;
  const { data: positions } = useVesselPositions(active ? mmsi : null, historyHours);
  const track = positions ?? [];
  const currentPoint = active ? interpolateTrackPosition(track, playbackProgress) : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {TRAJECTORY_WINDOW_OPTIONS.map((opt) => {
          // No button starts "selected" — historyHours has a default value,
          // but nothing should look chosen until the user actually picks one.
          const optActive = active && historyHours === opt.hours;
          return (
            <button
              key={opt.hours}
              type="button"
              onClick={() => setHistoryHours(opt.hours, mmsi)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                optActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-secondary"
              )}
            >
              {t(opt.label)}
            </button>
          );
        })}
      </div>

      {active && track.length >= 2 && (
        <div className="space-y-1.5 border-t border-border pt-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 shrink-0"
              onClick={togglePlayback}
              aria-label={playbackPlaying ? t("Pause") : t("Play")}
            >
              {playbackPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            </Button>
            <input
              type="range"
              min={0}
              max={1000}
              value={Math.round(playbackProgress * 1000)}
              onChange={(e) => setPlaybackProgress(Number(e.target.value) / 1000)}
              className="h-1.5 w-full flex-1 cursor-pointer accent-primary"
              aria-label={t("Playback position")}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{formatTime(track[0].timestamp)}</span>
            <span className="font-medium text-foreground">
              {currentPoint ? formatTime(currentPoint.timestamp) : "—"}
            </span>
            <span>{formatTime(track[track.length - 1].timestamp)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
