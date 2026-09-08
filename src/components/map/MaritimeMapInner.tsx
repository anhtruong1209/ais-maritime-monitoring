"use client";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { useEffect, useState } from "react";
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

/** MarineTraffic-style bottom-right readout: cursor lat/lon + zoom level. */
function MapReadout() {
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(null);
  // Zoom is tracked via the 'zoomend' event rather than calling
  // map.getZoom() on every render: a render-time call can fire after the
  // map has been torn down (e.g. this map was inside a dialog that just
  // closed) and throw, which crashes the whole tree instead of just this
  // readout. Event-driven reads only ever fire while the map is alive.
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  useMapEvents({
    mousemove: (e) => setLatLng(e.latlng),
    mouseout: () => setLatLng(null),
    zoomend: () => setZoom(map.getZoom()),
  });

  return (
    <div className="pointer-events-none absolute right-2 bottom-2 z-[1000] rounded border border-border bg-card/90 px-2.5 py-1 font-mono text-xs text-muted-foreground shadow backdrop-blur">
      {latLng ? `${latLng.lat.toFixed(4)}°, ${latLng.lng.toFixed(4)}°` : "—"} · zoom {zoom}
    </div>
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
  const selectedLatLng: LatLngTuple | null =
    selected?.latestPosition != null
      ? [selected.latestPosition.latitude, selected.latestPosition.longitude]
      : null;
  const flaggedVesselIds = new Set(anomalies.map((a) => a.vesselId));

  const vesselsWithPosition = vessels.filter((v) => v.latestPosition);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const showHeatmap =
    vesselsWithPosition.length >= HEATMAP_MIN_VESSELS && currentZoom < HEATMAP_ZOOM_THRESHOLD;

  const markers = vesselsWithPosition.map((vessel) => {
    const pos = vessel.latestPosition!;
    return (
      <Marker
        key={vessel.id}
        position={[pos.latitude, pos.longitude]}
        icon={createVesselIcon({
          shipType: vessel.shipType,
          cog: pos.cog,
          selected: vessel.id === selectedVesselId,
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
  });

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
        <VesselHeatmapLayer
          points={vesselsWithPosition.map((v) => ({
            latitude: v.latestPosition!.latitude,
            longitude: v.latestPosition!.longitude,
            intensity: v.status === "moving" ? 1 : 0.5,
          }))}
          zoomInTarget={HEATMAP_ZOOM_THRESHOLD + 2}
        />
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
      <MapReadout />
      <MapResizeHandler />
      <ZoomTracker onZoomChange={setCurrentZoom} />
    </MapContainer>
  );
}
