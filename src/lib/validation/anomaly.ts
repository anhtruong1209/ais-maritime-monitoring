import { z } from "zod";
import { ANOMALY_SEVERITY_ORDER, ANOMALY_STATUSES, ANOMALY_TYPES } from "@/lib/constants";

export const anomalyListQuerySchema = z.object({
  type: z.enum(ANOMALY_TYPES as [string, ...string[]]).optional(),
  severity: z.enum(ANOMALY_SEVERITY_ORDER as [string, ...string[]]).optional(),
  status: z.enum(ANOMALY_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export type AnomalyListQuery = z.infer<typeof anomalyListQuerySchema>;
