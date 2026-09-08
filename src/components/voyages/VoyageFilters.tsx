"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "all";
const STATUSES = ["scheduled", "in_progress", "completed", "cancelled"];

export function VoyageFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === ALL) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`/voyages?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        defaultValue={searchParams.get("destinationPort") ?? ""}
        onBlur={(e) => updateParam("destinationPort", e.target.value)}
        placeholder="Destination port…"
        className="h-9 w-48"
      />
      <Input
        type="date"
        defaultValue={searchParams.get("departureDate") ?? ""}
        onChange={(e) => updateParam("departureDate", e.target.value)}
        className="h-9 w-40"
      />
      <Select
        value={searchParams.get("status") ?? ALL}
        onValueChange={(v) => updateParam("status", v)}
      >
        <SelectTrigger className="h-9 w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {STATUSES.map((status) => (
            <SelectItem key={status} value={status} className="capitalize">
              {status.replace("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
