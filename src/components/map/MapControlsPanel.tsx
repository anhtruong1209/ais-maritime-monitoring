"use client";

import { RotateCcw, Search, X } from "lucide-react";
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
import { SHIP_TYPES, VESSEL_STATUSES } from "@/lib/constants";
import { TILE_LAYERS } from "@/lib/map/config";
import { SHIP_TYPE_LABELS } from "@/lib/map/ship-type-meta";

const ALL = "all";

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
}

export function MapControlsPanel({
  filters,
  onChange,
  onReset,
  selectedVesselName,
  onClearSelection,
}: MapControlsPanelProps) {
  return (
    <div className="w-80 space-y-3.5 rounded-md border border-border bg-card/95 p-4 text-sm shadow-lg backdrop-blur">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search vessel name or MMSI…"
          className="h-10 pl-8"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Select value={filters.shipType} onValueChange={(v) => onChange({ shipType: v ?? ALL })}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All types</SelectItem>
            {SHIP_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {SHIP_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(v) => onChange({ status: v ?? ALL })}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {VESSEL_STATUSES.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Select value={filters.tileLayerId} onValueChange={(v) => v && onChange({ tileLayerId: v })}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue placeholder="Basemap" />
        </SelectTrigger>
        <SelectContent>
          {TILE_LAYERS.map((layer) => (
            <SelectItem key={layer.id} value={layer.id}>
              {layer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="space-y-2 border-t border-border pt-2">
        <label className="flex items-center justify-between">
          <span className="text-muted-foreground">Historical trajectory</span>
          <Switch
            checked={filters.showHistorical}
            onCheckedChange={(v) => onChange({ showHistorical: v })}
            disabled={!selectedVesselName}
          />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-muted-foreground">Predicted trajectory</span>
          <Switch
            checked={filters.showPredicted}
            onCheckedChange={(v) => onChange({ showPredicted: v })}
            disabled={!selectedVesselName}
          />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-muted-foreground">Anomaly alerts</span>
          <Switch
            checked={filters.showAnomalies}
            onCheckedChange={(v) => onChange({ showAnomalies: v })}
          />
        </label>
      </div>

      {selectedVesselName && (
        <div className="flex items-center justify-between rounded bg-secondary px-2 py-1.5 text-xs">
          <span className="truncate font-medium">{selectedVesselName}</span>
          <Button variant="ghost" size="icon" className="size-5" onClick={onClearSelection}>
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={onReset}>
        <RotateCcw className="size-3.5" /> Reset view
      </Button>
    </div>
  );
}
