import type { Museum, MuseumRepository } from "./index.ts";

export class Repository implements MuseumRepository {
  storage = new Map<string, Museum>();

  // Returns records in 'storgae' Map
  async getAll() {
    return await [...this.storage.values()];
  }
}
