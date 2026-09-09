import { z } from "zod";
import { VOYAGE_STATUSES } from "@/lib/constants";

export const voyageListQuerySchema = z.object({
  destinationPort: z.string().trim().max(100).optional(),
  status: z.enum(VOYAGE_STATUSES).optional(),
  departureDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export type VoyageListQuery = z.infer<typeof voyageListQuerySchema>;
