export interface Fleet {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface FleetWithCount extends Fleet {
  vesselCount: number;
}
