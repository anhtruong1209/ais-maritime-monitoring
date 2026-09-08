import "leaflet.heat";
import L from "leaflet";
import { useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";

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
 *
 * Clicking anywhere on the heatmap zooms into that spot — there's nothing
 * to click as an individual marker yet, so a click is read as "drill into
 * this area" rather than "select this vessel".
 */
export function VesselHeatmapLayer({
  points,
  zoomInTarget,
}: {
  points: HeatPoint[];
  zoomInTarget: number;
}) {
  const map = useMap();

  useEffect(() => {
    const heat = L.heatLayer(
      points.map((p) => [p.latitude, p.longitude, p.intensity ?? 1]),
      { radius: 18, blur: 22, maxZoom: 10, minOpacity: 0.35 }
    );
    heat.addTo(map);
    // leaflet.heat's canvas doesn't participate in Leaflet's zoom-animation
    // transform the way tile/vector layers do, so without this it visibly
    // jumps mid-animation instead of smoothly scaling — `leaflet-zoom-hide`
    // is a class Leaflet's own core CSS/JS already knows to fade out during
    // the zoom animation and back in once it's redrawn at the new zoom.
    const canvas = (heat as unknown as { _canvas?: HTMLElement })._canvas;
    canvas?.classList.add("leaflet-zoom-hide");
    return () => {
      heat.remove();
    };
  }, [map, points]);

  useMapEvents({
    click: (e) => map.flyTo(e.latlng, zoomInTarget, { duration: 0.6 }),
  });

  return null;
}
