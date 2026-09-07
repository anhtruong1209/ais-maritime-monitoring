export interface AISPosition {
  id: string;
  vesselId: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  sog: number;
  cog: number;
  heading: number | null;
  navStatus: string | null;
  destination: string | null;
  createdAt: string;
}
