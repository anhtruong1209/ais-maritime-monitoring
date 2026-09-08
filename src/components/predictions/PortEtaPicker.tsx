"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePorts } from "@/hooks/use-ports";

const AUTO = "auto";

/** Lets the user ask "if it were headed to port X, what's the ETA?"
 * instead of only the vessel's own AIS-reported destination. */
export function PortEtaPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (portId: string | null) => void;
}) {
  const { data: ports } = usePorts();

  return (
    <Select value={value ?? AUTO} onValueChange={(v) => onChange(v === AUTO || !v ? null : v)}>
      <SelectTrigger className="h-10 w-64">
        <SelectValue placeholder="Destination port" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={AUTO}>Auto (AIS reported destination)</SelectItem>
        {ports?.map((port) => (
          <SelectItem key={port.id} value={port.id}>
            {port.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
