import { format, formatDistanceToNowStrict } from "date-fns";

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return format(new Date(iso), "dd MMM yyyy HH:mm");
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return format(new Date(iso), "HH:mm");
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return `${formatDistanceToNowStrict(new Date(iso))} ago`;
}

export function formatCoordinate(value: number, kind: "lat" | "lon"): string {
  const hemisphere = kind === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  return `${Math.abs(value).toFixed(4)}° ${hemisphere}`;
}

export function formatSog(sog: number): string {
  return `${sog.toFixed(1)} kn`;
}

export function formatCog(cog: number): string {
  return `${cog.toFixed(0)}°`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatDuration(startIso: string, endIso: string | null): string {
  if (!endIso) return "—";
  const totalMinutes = Math.max(
    0,
    Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60_000)
  );
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  parts.push(`${hours}h`);
  return parts.join(" ");
}
