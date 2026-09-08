"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SHIP_TYPES, VESSEL_STATUS_LABELS, VESSEL_STATUSES } from "@/lib/constants";
import { TILE_LAYERS } from "@/lib/map/config";
import { SHIP_TYPE_LABELS } from "@/lib/map/ship-type-meta";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { VesselWithLatestPosition } from "@/types";

const ALL = "all";
const MAX_SUGGESTIONS = 8;
// Every keystroke otherwise re-fetched the whole (up to 1500-row) vessel
// list from the server and rebuilt the entire marker/cluster tree — very
// noticeably janky while typing. Suggestions stay instant (computed
// client-side from what's already loaded); only the server-driving
// filter waits for a short pause in typing.
const SEARCH_DEBOUNCE_MS = 300;

export interface MapFilterState {
  search: string;
  shipType: string;
  status: string;
  tileLayerId: string;
  showHistorical: boolean;
  showPredicted: boolean;
  showAnomalies: boolean;
}

interface MapControlsPanelProps {
  filters: MapFilterState;
  onChange: (patch: Partial<MapFilterState>) => void;
  onReset: () => void;
  selectedVesselName?: string | null;
  onClearSelection?: () => void;
  /** Candidate vessels for the search box's autocomplete dropdown. */
  vessels?: VesselWithLatestPosition[];
  /** Called when the user picks one of the autocomplete suggestions. */
  onSelectVessel?: (vessel: VesselWithLatestPosition) => void;
}

function VesselSearchBox({
  search,
  onSearchChange,
  vessels,
  onSelectVessel,
  className,
  inputClassName,
  placeholder,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  vessels: VesselWithLatestPosition[];
  onSelectVessel?: (vessel: VesselWithLatestPosition) => void;
  className?: string;
  inputClassName?: string;
  placeholder: string;
}) {
  const [focused, setFocused] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Local, instant-feedback value the input actually displays; `search`
  // (the prop) only catches up after the debounce delay. Re-synced
  // whenever `search` changes from outside (Reset view, a suggestion
  // pick, clearing the selected-vessel chip) — adjusted during render
  // (React's recommended pattern for this) rather than in an effect, so
  // it takes effect in the same commit instead of one render later.
  const [localValue, setLocalValue] = useState(search);
  const [syncedSearch, setSyncedSearch] = useState(search);
  if (search !== syncedSearch) {
    setSyncedSearch(search);
    setLocalValue(search);
  }
  useEffect(() => () => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
  }, []);

  const suggestions = useMemo(() => {
    const query = localValue.trim().toLowerCase();
    if (!query) return [];
    return vessels
      .filter((v) => v.name.toLowerCase().includes(query) || v.mmsi.includes(query))
      .slice(0, MAX_SUGGESTIONS);
  }, [localValue, vessels]);

  const showDropdown = focused && suggestions.length > 0;

  function handleInputChange(value: string) {
    setLocalValue(value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => onSearchChange(value), SEARCH_DEBOUNCE_MS);
  }

  function handleSelect(vessel: VesselWithLatestPosition) {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    onSelectVessel?.(vessel);
    setLocalValue(vessel.name);
    onSearchChange(vessel.name);
    setFocused(false);
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={localValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          // Delay so a click on a suggestion registers before the list unmounts.
          blurTimeout.current = setTimeout(() => setFocused(false), 150);
        }}
        placeholder={placeholder}
        className={cn("h-10 pl-8", inputClassName)}
        autoComplete="off"
      />
      {showDropdown && (
        <ul className="absolute top-full right-0 left-0 z-10 mt-1 max-h-64 overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-lg">
          {suggestions.map((vessel) => (
            <li key={vessel.id}>
              <button
                type="button"
                className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-secondary"
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (blurTimeout.current) clearTimeout(blurTimeout.current);
                  handleSelect(vessel);
                }}
              >
                <span className="font-medium">{vessel.name}</span>
                <span className="text-xs text-muted-foreground">MMSI {vessel.mmsi}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Collapsed to a single icon button by default (top-right of the map) —
 * expands into the full filter/basemap/layer panel on click, instead of
 * permanently occupying map space. Search stays visible either way since
 * it's the most-used control.
 */
export function MapControlsPanel({
  filters,
  onChange,
  onReset,
  selectedVesselName,
  onClearSelection,
  vessels = [],
  onSelectVessel,
}: MapControlsPanelProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  const searchProps = {
    search: filters.search,
    onSearchChange: (value: string) => onChange({ search: value }),
    vessels,
    onSelectVessel,
    placeholder: t("Search vessel name or MMSI…"),
  };

  // Always reachable — regardless of whether the config panel is expanded
  // — so a selected vessel can be cleared (stopping its highlight/fly-to)
  // without first having to open the panel to find the clear button.
  const selectedChip = selectedVesselName && (
    <div className="flex items-center gap-1.5 rounded-md border border-border bg-card/95 py-1 pr-1 pl-2.5 text-xs shadow-lg backdrop-blur">
      <span className="max-w-40 truncate font-medium">{selectedVesselName}</span>
      <Button
        variant="ghost"
        size="icon"
        className="size-6"
        onClick={onClearSelection}
        aria-label={t("Clear selection")}
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );

  if (!open) {
    return (
      <div className="flex flex-col items-end gap-2">
        {selectedChip}
        <div className="flex items-start gap-2">
          <VesselSearchBox
            {...searchProps}
            className="w-64"
            inputClassName="border-border bg-card/95 shadow-lg backdrop-blur"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 border-border bg-card/95 shadow-lg backdrop-blur"
            onClick={() => setOpen(true)}
            aria-label={t("Basemap")}
          >
            <SlidersHorizontal className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {selectedChip}
      <div className="w-80 space-y-3.5 rounded-md border border-border bg-card/95 p-4 text-sm shadow-lg backdrop-blur">
      <div className="flex items-center justify-between">
        <VesselSearchBox {...searchProps} className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          className="ml-2 size-8 shrink-0"
          onClick={() => setOpen(false)}
          aria-label={t("Close")}
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Select value={filters.shipType} onValueChange={(v) => onChange({ shipType: v ?? ALL })}>
          <SelectTrigger className="h-10 w-full">
            <SelectValue placeholder={t("Type")}>
              {(v: string) => (v === ALL ? t("All types") : t(SHIP_TYPE_LABELS[v as keyof typeof SHIP_TYPE_LABELS]))}
            </SelectValue>
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

        <Select value={filters.status} onValueChange={(v) => onChange({ status: v ?? ALL })}>
          <SelectTrigger className="h-10 w-full">
            <SelectValue placeholder={t("Status")}>
              {(v: string) => (v === ALL ? t("All statuses") : t(VESSEL_STATUS_LABELS[v as keyof typeof VESSEL_STATUS_LABELS]))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("All statuses")}</SelectItem>
            {VESSEL_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {t(VESSEL_STATUS_LABELS[status])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Select value={filters.tileLayerId} onValueChange={(v) => v && onChange({ tileLayerId: v })}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue placeholder={t("Basemap")}>
            {(v: string) => t(TILE_LAYERS.find((l) => l.id === v)?.name ?? v)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {TILE_LAYERS.map((layer) => (
            <SelectItem key={layer.id} value={layer.id}>
              {t(layer.name)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="space-y-2 border-t border-border pt-2">
        <label className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("Historical trajectory")}</span>
          <Switch
            checked={filters.showHistorical}
            onCheckedChange={(v) => onChange({ showHistorical: v })}
            disabled={!selectedVesselName}
          />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("Predicted trajectory")}</span>
          <Switch
            checked={filters.showPredicted}
            onCheckedChange={(v) => onChange({ showPredicted: v })}
            disabled={!selectedVesselName}
          />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("Anomaly alerts")}</span>
          <Switch
            checked={filters.showAnomalies}
            onCheckedChange={(v) => onChange({ showAnomalies: v })}
          />
        </label>
      </div>

      <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={onReset}>
        <RotateCcw className="size-3.5" /> {t("Reset view")}
      </Button>
      </div>
    </div>
  );
}
