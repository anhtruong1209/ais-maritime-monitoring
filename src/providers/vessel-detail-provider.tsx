"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_PREDICTION_HORIZON_MINUTES } from "@/lib/constants";

// Full historical-track playback runs over this many milliseconds,
// regardless of how long the actual selected window (1h vs 24h) spans —
// a fixed, comfortable-to-watch demo speed rather than real-time replay.
const PLAYBACK_DURATION_MS = 15_000;
const PLAYBACK_TICK_MS = 100;

interface VesselDetailContextValue {
  selectedMmsi: string | null;
  openVessel: (mmsi: string) => void;
  closeVessel: () => void;
  /** "Last N hours" window chosen in the detail panel's History tab —
   * shared so the /map page can draw that same window's trajectory on the
   * actual map instead of the panel needing its own embedded map. */
  historyHours: number;
  setHistoryHours: (hours: number, mmsi: string) => void;
  /** True only once the user has actually picked a window for a vessel —
   * the map should stay clean until asked, not draw a trajectory the
   * moment a vessel's detail panel opens. */
  historyRequested: boolean;
  /** Which vessel historyHours/historyRequested currently apply to — lets
   * selecting a *different* vessel invalidate a stale trajectory request
   * left over from whichever vessel was open before. */
  historyVesselMmsi: string | null;
  /** How far ahead the trajectory prediction looks — shared the same way
   * as historyHours, so picking a horizon in the detail panel also
   * changes the predicted route drawn on the actual map. */
  predictionHorizonMinutes: number;
  setPredictionHorizonMinutes: (minutes: number, mmsi: string) => void;
  /** Same "nothing shown until asked" rule as historyRequested — opening
   * a vessel's detail panel shouldn't draw a predicted route or pick a
   * horizon on its own. */
  predictionRequested: boolean;
  /** Which vessel predictionHorizonMinutes/predictionRequested apply to. */
  predictionVesselMmsi: string | null;
  /** 0-1 position along the currently-loaded historical track. Purely
   * client-side (see src/lib/map/playback.ts) — never triggers a fetch. */
  playbackProgress: number;
  setPlaybackProgress: (progress: number) => void;
  playbackPlaying: boolean;
  togglePlayback: () => void;
  /** MMSI of the "other" vessel picked in the Collision Risk card's pair
   * picker, if any — shared so the /map page can draw both vessels'
   * predicted CPA paths on the actual map instead of the panel needing its
   * own embedded map (same reasoning as historyHours/predictionHorizonMinutes). */
  collisionCompareMmsi: string | null;
  setCollisionCompareMmsi: (mmsi: string | null) => void;
  /** Same "nothing shown/fetched until asked" rule as historyRequested —
   * scanning the fleet for collision risk is comparatively heavy (it needs
   * every vessel's position, not just this one), so CollisionRiskCard
   * shouldn't run it the instant a detail panel opens. */
  collisionRiskRequested: boolean;
  requestCollisionRisk: () => void;
}

const VesselDetailContext = createContext<VesselDetailContextValue | null>(null);

export function VesselDetailProvider({ children }: { children: React.ReactNode }) {
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null);
  const [historyHours, setHistoryHoursState] = useState(24);
  const [historyRequested, setHistoryRequested] = useState(false);
  const [historyVesselMmsi, setHistoryVesselMmsi] = useState<string | null>(null);
  const [predictionHorizonMinutes, setPredictionHorizonMinutesState] = useState(
    DEFAULT_PREDICTION_HORIZON_MINUTES
  );
  const [predictionRequested, setPredictionRequested] = useState(false);
  const [predictionVesselMmsi, setPredictionVesselMmsi] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackPlaying, setPlaybackPlaying] = useState(false);
  const [collisionCompareMmsi, setCollisionCompareMmsi] = useState<string | null>(null);
  const [collisionRiskRequested, setCollisionRiskRequested] = useState(false);

  const openVessel = useCallback((mmsi: string) => {
    setSelectedMmsi(mmsi);
    // Always start clean — comparing against the last-requested vessel's
    // mmsi to decide whether to reset was fragile (stale closures over
    // openVessel's own dependency array could carry a request over to a
    // vessel that never asked for it). Unconditionally resetting is
    // simpler and correct: the rare case of reselecting the exact same
    // vessel while its panel is already open just means re-picking a
    // window, which is a fine cost for a bug-free default.
    setHistoryRequested(false);
    setPredictionRequested(false);
    setPlaybackPlaying(false);
    setPlaybackProgress(0);
    setCollisionCompareMmsi(null);
    setCollisionRiskRequested(false);
  }, []);

  const closeVessel = useCallback(() => {
    setSelectedMmsi(null);
    setHistoryRequested(false);
    setPredictionRequested(false);
    setPlaybackPlaying(false);
    setPlaybackProgress(0);
    setCollisionCompareMmsi(null);
    setCollisionRiskRequested(false);
  }, []);

  const requestCollisionRisk = useCallback(() => setCollisionRiskRequested(true), []);

  const setHistoryHours = useCallback((hours: number, mmsi: string) => {
    setHistoryHoursState(hours);
    setHistoryRequested(true);
    setHistoryVesselMmsi(mmsi);
    // A different window is a different track to replay — start over.
    setPlaybackPlaying(false);
    setPlaybackProgress(0);
  }, []);

  const setPredictionHorizonMinutes = useCallback((minutes: number, mmsi: string) => {
    setPredictionHorizonMinutesState(minutes);
    setPredictionRequested(true);
    setPredictionVesselMmsi(mmsi);
  }, []);

  const togglePlayback = useCallback(() => {
    setPlaybackPlaying((wasPlaying) => {
      // Restart from the beginning if it had already finished.
      if (!wasPlaying) {
        setPlaybackProgress((p) => (p >= 1 ? 0 : p));
      }
      return !wasPlaying;
    });
  }, []);

  useEffect(() => {
    if (!playbackPlaying) return;
    const step = PLAYBACK_TICK_MS / PLAYBACK_DURATION_MS;
    const id = setInterval(() => {
      setPlaybackProgress((p) => {
        const next = p + step;
        if (next >= 1) {
          setPlaybackPlaying(false);
          return 1;
        }
        return next;
      });
    }, PLAYBACK_TICK_MS);
    return () => clearInterval(id);
  }, [playbackPlaying]);

  const value = useMemo(
    () => ({
      selectedMmsi,
      openVessel,
      closeVessel,
      historyHours,
      setHistoryHours,
      historyRequested,
      historyVesselMmsi,
      predictionHorizonMinutes,
      setPredictionHorizonMinutes,
      predictionRequested,
      predictionVesselMmsi,
      playbackProgress,
      setPlaybackProgress,
      playbackPlaying,
      togglePlayback,
      collisionCompareMmsi,
      setCollisionCompareMmsi,
      collisionRiskRequested,
      requestCollisionRisk,
    }),
    [
      selectedMmsi,
      openVessel,
      closeVessel,
      historyHours,
      setHistoryHours,
      historyRequested,
      historyVesselMmsi,
      predictionHorizonMinutes,
      setPredictionHorizonMinutes,
      predictionRequested,
      predictionVesselMmsi,
      playbackProgress,
      playbackPlaying,
      togglePlayback,
      collisionCompareMmsi,
      collisionRiskRequested,
      requestCollisionRisk,
    ]
  );

  return (
    <VesselDetailContext.Provider value={value}>{children}</VesselDetailContext.Provider>
  );
}

/** Opens the shared vessel detail panel for a given MMSI from anywhere in
 * the app shell — vessel tables, map markers, fleet rosters, etc. This is
 * the single place vessel detail lives; a marker click opens it directly
 * rather than a separate small popup that then links to it. */
export function useVesselDetailDialog() {
  const ctx = useContext(VesselDetailContext);
  if (!ctx) {
    throw new Error("useVesselDetailDialog must be used within VesselDetailProvider");
  }
  return ctx;
}
