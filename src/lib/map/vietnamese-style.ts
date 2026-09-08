import type { StyleSpecification } from "maplibre-gl";

/**
 * Rewrites every label layer in a MapLibre style so it prefers the
 * `name:vi` field (falling back to `name:en`, then the generic `name`)
 * instead of whatever the style author picked by default.
 *
 * Why: the source vector tiles (OpenFreeMap/OpenMapTiles, built from OSM
 * data) render whichever `name` variant an OSM contributor happened to tag
 * — for the East Sea / Hoang Sa / Truong Sa area this can surface non-
 * Vietnamese script. This does NOT rewrite or fabricate any place name —
 * it only picks a different *existing* tag on the same underlying feature
 * when one is present. Where a feature has no `name:vi` tag at all in the
 * open dataset, its original label still shows; that's a gap in upstream
 * OSM tagging this app has no authority to invent data for.
 */
export function preferVietnameseLabels(style: StyleSpecification): StyleSpecification {
  const patched: StyleSpecification = structuredClone(style);

  for (const layer of patched.layers) {
    if (layer.type !== "symbol") continue;
    if (!layer.layout || !("text-field" in layer.layout)) continue;

    layer.layout["text-field"] = [
      "coalesce",
      ["get", "name:vi"],
      ["get", "name:en"],
      ["get", "name"],
    ];
  }

  return patched;
}
