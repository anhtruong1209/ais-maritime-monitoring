import "leaflet.heat";
import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export interface HeatPoint {
  latitude: number;
  longitude: number;
  /** 0-1, defaults to 1 if omitted (e.g. weight moving vessels higher). */
  intensity?: number;
}

/**
 * Density heatmap for vessel positions — used at low zoom / high vessel
 * counts instead of individual markers, where hundreds of overlapping
 * icons would be unreadable and expensive to render. Swaps back to real
 * markers once zoomed in far enough to make individual vessels legible
 * (see HEATMAP_ZOOM_THRESHOLD in MaritimeMapInner.tsx).
 */
export function VesselHeatmapLayer({ points }: { points: HeatPoint[] }) {
  const map = useMap();

  useEffect(() => {
    const heat = L.heatLayer(
      points.map((p) => [p.latitude, p.longitude, p.intensity ?? 1]),
      { radius: 18, blur: 22, maxZoom: 10, minOpacity: 0.35 }
    );
    heat.addTo(map);
    return () => {
      heat.remove();
    };
  }, [map, points]);

  return null;
}
