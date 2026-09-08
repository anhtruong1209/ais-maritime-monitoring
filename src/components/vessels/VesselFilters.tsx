"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SHIP_TYPES, VESSEL_STATUSES } from "@/lib/constants";
import { SHIP_TYPE_LABELS } from "@/lib/map/ship-type-meta";
import { useLocale } from "@/providers/locale-provider";

const ALL = "all";

export function VesselFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const { t } = useLocale();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === ALL) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`/vessels?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("search", search);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form onSubmit={handleSearchSubmit} className="w-56">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("Search name or MMSI…")}
          className="h-9"
          autoComplete="off"
        />
      </form>

      <Select
        value={searchParams.get("shipType") ?? ALL}
        onValueChange={(v) => updateParam("shipType", v)}
      >
        <SelectTrigger className="h-9 w-40">
          <SelectValue placeholder={t("Type")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("All types")}</SelectItem>
          {SHIP_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {t(SHIP_TYPE_LABELS[type])}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("status") ?? ALL}
        onValueChange={(v) => updateParam("status", v)}
      >
        <SelectTrigger className="h-9 w-36">
          <SelectValue placeholder={t("Status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("All statuses")}</SelectItem>
          {VESSEL_STATUSES.map((status) => (
            <SelectItem key={status} value={status} className="capitalize">
              {t(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        defaultValue={searchParams.get("destination") ?? ""}
        onBlur={(e) => updateParam("destination", e.target.value)}
        placeholder={t("Destination…")}
        className="h-9 w-40"
        autoComplete="off"
      />
    </div>
  );
}
