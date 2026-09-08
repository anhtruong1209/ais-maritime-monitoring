import "@maplibre/maplibre-gl-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { StyleSpecification } from "maplibre-gl";
import { preferVietnameseLabels } from "@/lib/map/vietnamese-style";

/**
 * Renders a MapLibre GL vector basemap as a Leaflet layer (via
 * @maplibre/maplibre-gl-leaflet) instead of a react-leaflet <TileLayer>.
 * Vector tiles let us rewrite label text-fields client-side to prefer
 * Vietnamese place names — see preferVietnameseLabels().
 */
export function VectorBasemapLayer({
  styleUrl,
  attribution,
}: {
  styleUrl: string;
  attribution: string;
}) {
  const map = useMap();

  useEffect(() => {
    let cancelled = false;
    let layer: L.MaplibreGL | undefined;

    map.attributionControl.addAttribution(attribution);

    fetch(styleUrl)
      .then((res) => res.json())
      .then((style: StyleSpecification) => {
        if (cancelled) return;
        layer = L.maplibreGL({ style: preferVietnameseLabels(style), attributionControl: false });
        layer.addTo(map);
      })
      .catch((error) => {
        console.error("Failed to load vector basemap style", error);
      });

    return () => {
      cancelled = true;
      layer?.remove();
      map.attributionControl.removeAttribution(attribution);
    };
  }, [map, styleUrl, attribution]);

  return null;
}
