import { z } from "zod";
import { SHIP_TYPES, VESSEL_STATUSES } from "@/lib/constants";

export const vesselListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  shipType: z.enum(SHIP_TYPES as [string, ...string[]]).optional(),
  status: z.enum(VESSEL_STATUSES as [string, ...string[]]).optional(),
  destination: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  // Capped at 500 — comfortably above the ~300-vessel demo fleet so the
  // full-map view can request "all" in one page without an unbounded query.
  pageSize: z.coerce.number().int().min(1).max(500).default(25),
});

export type VesselListQuery = z.infer<typeof vesselListQuerySchema>;

export const mmsiParamSchema = z
  .string()
  .trim()
  .regex(/^\d{9}$/, "MMSI must be exactly 9 digits");

export const positionsQuerySchema = z.object({
  hours: z.coerce.number().int().min(1).max(168).default(24),
});
