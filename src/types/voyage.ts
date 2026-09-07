export type VoyageStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface Voyage {
  id: string;
  vesselId: string;
  departurePort: string;
  destinationPort: string;
  departureTime: string;
  estimatedArrival: string | null;
  actualArrival: string | null;
  status: VoyageStatus;
  createdAt: string;
}

export interface VoyageWithVessel extends Voyage {
  vesselName: string;
  vesselMmsi: string;
}
