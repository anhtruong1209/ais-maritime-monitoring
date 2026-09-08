"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ANOMALY_SEVERITY_ORDER, ANOMALY_TYPES, ANOMALY_TYPE_LABELS } from "@/lib/constants";
import { useLocale } from "@/providers/locale-provider";

const ALL = "all";
const STATUSES = ["open", "acknowledged", "resolved", "dismissed"];

export function AnomalyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === ALL) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`/alerts?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={searchParams.get("type") ?? ALL} onValueChange={(v) => updateParam("type", v)}>
        <SelectTrigger className="h-9 w-56">
          <SelectValue placeholder={t("Anomaly type")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("All types")}</SelectItem>
          {ANOMALY_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {t(ANOMALY_TYPE_LABELS[type])}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("severity") ?? ALL}
        onValueChange={(v) => updateParam("severity", v)}
      >
        <SelectTrigger className="h-9 w-36">
          <SelectValue placeholder={t("Severity")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("All severities")}</SelectItem>
          {ANOMALY_SEVERITY_ORDER.map((severity) => (
            <SelectItem key={severity} value={severity} className="capitalize">
              {t(severity)}
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
          {STATUSES.map((status) => (
            <SelectItem key={status} value={status} className="capitalize">
              {t(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
