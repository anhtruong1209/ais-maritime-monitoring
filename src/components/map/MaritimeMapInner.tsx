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
import { VesselPopupContent } from "./VesselPopup";
import type {
  AISPosition,
  AnomalyWithVessel,
  Port,
  PredictedPoint,
  VesselWithLatestPosition,
} from "@/types";

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
  const map = useMapEvents({
    mousemove: (e) => setLatLng(e.latlng),
    mouseout: () => setLatLng(null),
  });
  const zoom = map.getZoom();

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

  const markers = vessels
    .filter((v) => v.latestPosition)
    .map((vessel) => {
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
      scrollWheelZoom
      className={className ?? "h-full w-full"}
    >
      <TileLayer
        key={tileLayer.id}
        url={tileLayer.url}
        attribution={tileLayer.attribution}
        maxZoom={tileLayer.maxZoom}
        className={tileLayer.tileClassName}
      />

      {ports.map((port) => (
        <Marker key={port.id} position={[port.latitude, port.longitude]} icon={createPortIcon()}>
          <Popup>
            <div className="text-sm font-semibold">{port.name}</div>
          </Popup>
        </Marker>
      ))}

      {cluster ? (
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
    </MapContainer>
  );
}
