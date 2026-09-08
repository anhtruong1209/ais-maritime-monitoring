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
import { useLocale } from "@/providers/locale-provider";

const ALL = "all";
const STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function VoyageFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();

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
        placeholder={t("Destination port…")}
        className="h-9 w-48"
        autoComplete="off"
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
          <SelectValue placeholder={t("Status")}>
            {(v: string) => (v === ALL ? t("All statuses") : t(STATUS_LABELS[v] ?? v))}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("All statuses")}</SelectItem>
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <SelectItem key={status} value={status}>
              {t(label)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
