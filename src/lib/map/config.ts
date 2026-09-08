import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";

// Map/basemap configuration lives here so the tile provider, default
// viewport, and AIS data layers stay independent of each other. Swapping
// the basemap later (e.g. for a licensed nautical chart provider) only
// requires editing this file — no map component needs to change.

export interface RasterTileLayerConfig {
  id: string;
  name: string;
  type: "raster";
  url: string;
  attribution: string;
  maxZoom: number;
}

export interface VectorTileLayerConfig {
  id: string;
  name: string;
  type: "vector";
  /** MapLibre style JSON endpoint. */
  styleUrl: string;
  attribution: string;
}

export type TileLayerConfig = RasterTileLayerConfig | VectorTileLayerConfig;

// Free, keyless tile providers only. No Google Maps, no paid Mapbox
// styles, no provider known to misrepresent Vietnam's maritime sovereignty
// (Hoang Sa / Truong Sa, the East Sea / South China Sea, the Gulf of
// Tonkin boundary).
//
// CARTO's basemaps.cartocdn.com raster tiles were deliberately left out:
// they now silently return a 200 OK PNG watermarked "API KEY REQUIRED" for
// unauthenticated requests instead of erroring — not actually free
// anymore, despite looking reachable from a plain HTTP check.
// OpenFreeMap (tiles.openfreemap.org): a free, keyless, community-run
// vector tile host serving OpenMapTiles-schema data with several style
// variants — chosen over a single plain raster basemap because (a) vector
// styles can be told which name tag to prefer per label, see
// preferVietnameseLabels() in ./vietnamese-style.ts, and (b) offering
// several contrast/color options in one dropdown, rather than only one
// pale style, addresses "this basemap is hard to read" directly.
function openFreeMapLayer(id: string, name: string, style: string): VectorTileLayerConfig {
  return {
    id,
    name,
    type: "vector",
    styleUrl: `https://tiles.openfreemap.org/styles/${style}`,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://openfreemap.org">OpenFreeMap</a>',
  };
}

// Named the way a general audience expects from Google/Apple Maps-style
// pickers (Road / Satellite / Terrain) rather than by provider name — most
// users don't know or care that the road layer comes from OpenStreetMap.
export const TILE_LAYERS: TileLayerConfig[] = [
  {
    id: "osm-standard",
    name: "Road",
    type: "raster",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  {
    id: "esri-satellite",
    name: "Satellite",
    type: "raster",
    // Esri's public World Imagery service — free for general/non-commercial
    // use with no API key. Useful to visually confirm a vessel's reported
    // position against real coastline/port imagery.
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    maxZoom: 19,
  },
  {
    id: "opentopomap",
    name: "Terrain",
    type: "raster",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    maxZoom: 17,
  },
  {
    id: "osm-humanitarian",
    name: "Humanitarian (HOT)",
    type: "raster",
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, tiles by HOT',
    maxZoom: 19,
  },
  // Experimental: vector basemaps with Vietnamese-preferred labels (see
  // preferVietnameseLabels() in ./vietnamese-style.ts). Currently rendering
  // background-only (land/water/road layers not showing) — suspected
  // maplibre-gl v6 vs. @maplibre/maplibre-gl-leaflet@0.1.4 incompatibility,
  // not yet root-caused. Left in the picker as opt-in, NOT the default,
  // until that's fixed — the raster layers above are the reliable ones.
  openFreeMapLayer("vn-bright", "Bright — vector, experimental", "bright"),
  openFreeMapLayer("vn-liberty", "Liberty — vector, experimental", "liberty"),
  openFreeMapLayer("vn-fiord", "Fiord — vector, experimental", "fiord"),
  openFreeMapLayer("vn-dark", "Dark — vector, experimental", "dark"),
  openFreeMapLayer("vn-positron", "Positron — vector, experimental", "positron"),
];

export const DEFAULT_TILE_LAYER_ID = "osm-standard";

// Centered on the East Sea / South China Sea off central Vietnam so the
// mainland coastline, Hoang Sa, and Truong Sa are all visible by default.
export const VIETNAM_CENTER: LatLngTuple = [15.5, 111.0];
export const VIETNAM_DEFAULT_ZOOM = 6;

// Loose viewport bounds covering the mainland, Gulf of Tonkin, Hoang Sa
// and Truong Sa. Used only to constrain the default map view — not a
// statement of any official maritime boundary.
export const VIETNAM_VIEW_BOUNDS: LatLngBoundsExpression = [
  [4.5, 100.0],
  [23.5, 118.0],
];

/**
 * Boundary/sovereignty overlays are intentionally NOT hard-coded here.
 * If added later, they must:
 *   1. Live in their own GeoJSON layer, toggled independently of AIS data.
 *   2. Document their source (e.g. a named official GIS dataset) in this
 *      file and in the README.
 * No boundary geometry is fabricated by this codebase.
 */
export const BOUNDARY_LAYERS: never[] = [];
