"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { MaritimeMapProps } from "./MaritimeMapInner";

// Leaflet touches `window` at import time, so it can only load on the
// client. This is the one file allowed to call next/dynamic with
// ssr: false — that's only permitted inside a Client Component module.
const MaritimeMapInner = dynamic(
  () => import("./MaritimeMapInner").then((m) => m.MaritimeMapInner),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-none" />,
  }
);

export function MapCanvas(props: MaritimeMapProps) {
  return <MaritimeMapInner {...props} />;
}
