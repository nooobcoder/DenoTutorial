export type Museum = {
  id: string;
  name: string;
  description: string;
  location: { lat: string; lng: string };
};

export interface MuseumController {
  getAll: () => Promise<Array<Museum>>;
}

export interface MuseumRepository {
  getAll: () => Promise<Array<Museum>>;
}
