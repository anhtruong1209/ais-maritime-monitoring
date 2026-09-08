const EARTH_RADIUS_KM = 6371;

export interface LatLng {
  latitude: number;
  longitude: number;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Great-circle distance in kilometers. */
export function haversineDistanceKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Initial bearing from a to b, in degrees [0, 360). */
export function bearingDegrees(a: LatLng, b: LatLng): number {
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Project a point `distanceKm` along `bearingDeg` from `origin`. */
export function destinationPoint(
  origin: LatLng,
  bearingDeg: number,
  distanceKm: number
): LatLng {
  const angularDistance = distanceKm / EARTH_RADIUS_KM;
  const bearing = toRad(bearingDeg);
  const lat1 = toRad(origin.latitude);
  const lon1 = toRad(origin.longitude);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

  return { latitude: toDeg(lat2), longitude: toDeg(lon2) };
}

/** Linear interpolation between two points (approximation, fine at this scale). */
export function interpolate(a: LatLng, b: LatLng, t: number): LatLng {
  return {
    latitude: a.latitude + (b.latitude - a.latitude) * t,
    longitude: a.longitude + (b.longitude - a.longitude) * t,
  };
}
