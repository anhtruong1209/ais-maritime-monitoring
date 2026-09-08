"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllVesselsForMap } from "@/hooks/use-vessels";

export function VesselPredictionSelect({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (mmsi: string) => void;
}) {
  const { data, isLoading } = useAllVesselsForMap({ status: "moving" });
  const vessels = [...(data?.data ?? [])].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Select value={value ?? undefined} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger className="h-9 w-72">
        <SelectValue placeholder={isLoading ? "Loading vessels…" : "Select a moving vessel…"} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {vessels.map((vessel) => (
          <SelectItem key={vessel.id} value={vessel.mmsi}>
            {vessel.name} · {vessel.mmsi}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
