import { MuseumController, MuseumRepository } from "./index.ts";

interface ControllerDependencies {
  museumRepository: MuseumRepository;
}

export class Controller implements MuseumController {
  museumRepository: MuseumRepository;

  constructor({ museumRepository }: ControllerDependencies) {
    this.museumRepository = museumRepository;
  }

  async getAll() {
    return await this.museumRepository.getAll();
  }
}
