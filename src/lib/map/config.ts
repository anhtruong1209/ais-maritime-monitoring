import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";

// Map/basemap configuration lives here so the tile provider, default
// viewport, and AIS data layers stay independent of each other. Swapping
// the basemap later (e.g. for a licensed nautical chart provider) only
// requires editing this file — no map component needs to change.

export interface TileLayerConfig {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  /**
   * Optional CSS class applied to each tile <img>. Used by "osm-dark" to
   * fake a dark basemap from plain OSM tiles via a CSS filter — no paid
   * "dark style" tile provider involved.
   */
  tileClassName?: string;
}

// OpenStreetMap tiles ONLY — served directly by the OSM Foundation / the
// Humanitarian OSM Team, genuinely free with no API key, no usage cap for
// this scale of app. (CARTO's basemaps.cartocdn.com raster tiles were
// removed from this list: they now silently return a 200 OK PNG watermarked
// "API KEY REQUIRED" for unauthenticated requests instead of erroring — not
// actually free anymore, despite looking reachable.)
// No provider here is known to misrepresent Vietnam's maritime sovereignty
// (Hoang Sa / Truong Sa, the East Sea / South China Sea, the Gulf of
// Tonkin boundary).
export const TILE_LAYERS: TileLayerConfig[] = [
  {
    id: "osm-dark",
    name: "OpenStreetMap (Dark)",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    tileClassName: "map-tiles-dark",
  },
  {
    id: "osm-standard",
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  {
    id: "osm-humanitarian",
    name: "Humanitarian (HOT)",
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, tiles by HOT',
    maxZoom: 19,
  },
];

export const DEFAULT_TILE_LAYER_ID = "osm-dark";

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
