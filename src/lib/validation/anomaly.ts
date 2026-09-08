import { z } from "zod";
import { ANOMALY_TYPES } from "@/lib/constants";

export const anomalyListQuerySchema = z.object({
  type: z.enum(ANOMALY_TYPES as [string, ...string[]]).optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  status: z.enum(["open", "acknowledged", "resolved", "dismissed"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export type AnomalyListQuery = z.infer<typeof anomalyListQuerySchema>;
