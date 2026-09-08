"use client";

import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import type { LatLngTuple } from "leaflet";
import {
  DEFAULT_TILE_LAYER_ID,
  TILE_LAYERS,
  VIETNAM_CENTER,
  VIETNAM_DEFAULT_ZOOM,
} from "@/lib/map/config";
import { createPortIcon, createVesselIcon } from "@/lib/map/icons";
import { AnomalyMarkerLayer } from "./AnomalyMarkerLayer";
import { PredictedRouteLayer } from "./PredictedRouteLayer";
import { TrajectoryLayer } from "./TrajectoryLayer";
import { VectorBasemapLayer } from "./VectorBasemapLayer";
import { VesselHeatmapLayer } from "./VesselHeatmapLayer";
import { VesselPopupContent } from "./VesselPopup";
import type {
  AISPosition,
  AnomalyWithVessel,
  Port,
  PredictedPoint,
  VesselWithLatestPosition,
} from "@/types";

// Below this zoom, a fleet-sized set of vessels draws as a density heatmap
// instead of individual markers — hundreds of overlapping icons at a
// zoomed-out view are both unreadable and expensive to render. Above it,
// real markers (clustered) take over so individual vessels are legible.
const HEATMAP_ZOOM_THRESHOLD = 7;
const HEATMAP_MIN_VESSELS = 150;

export interface MaritimeMapProps {
  vessels: VesselWithLatestPosition[];
  ports?: Port[];
  /** Open anomalies to draw as warning markers (route deviation, etc.). */
  anomalies?: AnomalyWithVessel[];
  selectedVesselId?: string | null;
  onSelectVessel?: (vessel: VesselWithLatestPosition) => void;
  historicalTrack?: AISPosition[];
  predictedRoute?: PredictedPoint[];
  center?: LatLngTuple;
  zoom?: number;
  tileLayerId?: string;
  cluster?: boolean;
  className?: string;
  /** Bump this value to fly back to `center`/`zoom` (e.g. a "Reset view" button). */
  resetSignal?: number;
}

/** Reports zoom changes to a parent that isn't itself inside the map's
 * context (MaritimeMapInner renders <MapContainer>, so it can't call
 * useMap()/useMapEvents() directly — this bridges that). */
function ZoomTracker({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  useMapEvents({ zoomend: (e) => onZoomChange(e.target.getZoom()) });
  return null;
}

function FlyToSelection({ target }: { target: LatLngTuple | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, Math.max(map.getZoom(), 9), { duration: 0.6 });
  }, [target, map]);
  return null;
}

/**
 * Highlight ring for the selected vessel — a separate, single-marker layer
 * instead of baking "selected" into that vessel's own icon. Baking it into
 * the icon meant the *entire* markers array (all vessels) had to be
 * recomputed on every selection change (since it's one array literal),
 * which forced the marker-cluster plugin to rebuild its whole tree on
 * every click — the likely cause of "click vessel B, map flies back to
 * vessel A" (a click landing during a mid-rebuild, stale state). Keeping
 * this independent means selecting a vessel never touches the main
 * markers array at all.
 */
function SelectionRing({ position }: { position: LatLngTuple | null }) {
  if (!position) return null;
  return (
    <CircleMarker
      center={position}
      radius={14}
      pathOptions={{ color: "#facc15", weight: 2, dashArray: "2.5 2.5", fill: false }}
      interactive={false}
    />
  );
}

/** Attaches Leaflet's built-in metric scale bar (bottom-left). */
function ScaleControl() {
  const map = useMap();
  useEffect(() => {
    const control = L.control.scale({ metric: true, imperial: false, position: "bottomleft" });
    control.addTo(map);
    return () => {
      control.remove();
    };
  }, [map]);
  return null;
}

/**
 * Leaflet measures its container's size once at creation and doesn't
 * notice later size changes on its own. When the map mounts inside a
 * dialog/modal (still animating open, or 0-sized until layout settles) or
 * any other container whose size changes after mount, Leaflet's cached
 * size goes stale and tiles/panes render offset or oversized. A
 * ResizeObserver + invalidateSize() keeps it correct in every case.
 */
function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    // Correct once immediately (covers the "mounted while still animating
    // in" case, which may not itself fire a ResizeObserver callback)...
    const raf = requestAnimationFrame(() => map.invalidateSize());
    // ...and again for any later resize (sidebar toggling, window resize
    // while the container's box actually changes, etc).
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [map]);
  return null;
}

function FlyToReset({
  signal,
  center,
  zoom,
}: {
  signal: number | undefined;
  center: LatLngTuple;
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (signal !== undefined) map.flyTo(center, zoom, { duration: 0.6 });
    // Only the signal should trigger this — center/zoom are read at fire time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal, map]);
  return null;
}

export function MaritimeMapInner({
  vessels,
  ports = [],
  anomalies = [],
  selectedVesselId = null,
  onSelectVessel,
  historicalTrack = [],
  predictedRoute = [],
  center = VIETNAM_CENTER,
  zoom = VIETNAM_DEFAULT_ZOOM,
  tileLayerId = DEFAULT_TILE_LAYER_ID,
  cluster = true,
  className,
  resetSignal,
}: MaritimeMapProps) {
  const tileLayer = TILE_LAYERS.find((t) => t.id === tileLayerId) ?? TILE_LAYERS[0];
  const selected = vessels.find((v) => v.id === selectedVesselId);
  const selectedLat = selected?.latestPosition?.latitude ?? null;
  const selectedLng = selected?.latestPosition?.longitude ?? null;
  // Memoized on the actual coordinates (not a fresh `[lat, lng]` literal
  // every render) — otherwise FlyToSelection's effect, which depends on
  // this reference, re-fires on every unrelated re-render (e.g. the zoom
  // state tracked below), snapping the map back to the selected vessel
  // every time the user tries to zoom out past it.
  const selectedLatLng: LatLngTuple | null = useMemo(
    () => (selectedLat != null && selectedLng != null ? [selectedLat, selectedLng] : null),
    [selectedLat, selectedLng]
  );
  const flaggedVesselIds = useMemo(
    () => new Set(anomalies.map((a) => a.vesselId)),
    [anomalies]
  );

  const vesselsWithPosition = useMemo(
    () => vessels.filter((v) => v.latestPosition),
    [vessels]
  );
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const showHeatmap =
    vesselsWithPosition.length >= HEATMAP_MIN_VESSELS && currentZoom < HEATMAP_ZOOM_THRESHOLD;

  // Memoized so the heat layer (which tears down and rebuilds its canvas
  // whenever this array's reference changes — see VesselHeatmapLayer) isn't
  // recreated on every render a pure zoom-level change causes — that
  // rebuild-on-every-tick was the "jumps around while zooming" jank.
  const heatPoints = useMemo(
    () =>
      vesselsWithPosition.map((v) => ({
        latitude: v.latestPosition!.latitude,
        longitude: v.latestPosition!.longitude,
        intensity: v.status === "moving" ? 1 : 0.5,
      })),
    [vesselsWithPosition]
  );

  // Deliberately does NOT depend on selectedVesselId — see SelectionRing's
  // comment above. Only actual vessel/anomaly data changes rebuild this.
  const markers = useMemo(
    () =>
      vesselsWithPosition.map((vessel) => {
        const pos = vessel.latestPosition!;
        return (
          <Marker
            key={vessel.id}
            position={[pos.latitude, pos.longitude]}
            icon={createVesselIcon({
              shipType: vessel.shipType,
              cog: pos.cog,
              moving: vessel.status === "moving",
              flagged: flaggedVesselIds.has(vessel.id),
            })}
            eventHandlers={{
              click: () => onSelectVessel?.(vessel),
            }}
          >
            <Popup>
              <VesselPopupContent vessel={vessel} />
            </Popup>
          </Marker>
        );
      }),
    [vesselsWithPosition, flaggedVesselIds, onSelectVessel]
  );

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      // Set explicitly on the Map itself (not just the tile layer): the
      // vector basemap (MapLibre, bridged in as a raw layer) doesn't carry
      // a `maxZoom` option the way a Leaflet <TileLayer> does, and without
      // one the marker-cluster plugin throws "Map has no maxZoom specified".
      maxZoom={19}
      scrollWheelZoom
      className={className ?? "h-full w-full"}
    >
      {tileLayer.type === "vector" ? (
        <VectorBasemapLayer
          key={tileLayer.id}
          styleUrl={tileLayer.styleUrl}
          attribution={tileLayer.attribution}
        />
      ) : (
        <TileLayer
          key={tileLayer.id}
          url={tileLayer.url}
          attribution={tileLayer.attribution}
          maxZoom={tileLayer.maxZoom}
        />
      )}

      {ports.map((port) => (
        <Marker key={port.id} position={[port.latitude, port.longitude]} icon={createPortIcon()}>
          <Popup>
            <div className="text-sm font-semibold">{port.name}</div>
          </Popup>
        </Marker>
      ))}

      {showHeatmap ? (
        <VesselHeatmapLayer points={heatPoints} zoomInTarget={HEATMAP_ZOOM_THRESHOLD + 2} />
      ) : cluster ? (
        <MarkerClusterGroup chunkedLoading maxClusterRadius={50} spiderfyOnMaxZoom>
          {markers}
        </MarkerClusterGroup>
      ) : (
        markers
      )}

      <TrajectoryLayer positions={historicalTrack} />
      <PredictedRouteLayer points={predictedRoute} />
      <AnomalyMarkerLayer anomalies={anomalies} />

      <FlyToSelection target={selectedLatLng} />
      <FlyToReset signal={resetSignal} center={center} zoom={zoom} />
      <ScaleControl />
      <SelectionRing position={selectedLatLng} />
      <MapResizeHandler />
      <ZoomTracker onZoomChange={setCurrentZoom} />
    </MapContainer>
  );
}
