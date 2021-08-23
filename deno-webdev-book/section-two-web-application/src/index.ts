import {
  Controller as MuseumController,
  Repository as MuseumRepository,
} from "./museums/index.ts";

const museumRepository: MuseumRepository = new MuseumRepository();
const museumController: MuseumController = new MuseumController({
  museumRepository: {
    getAll: async () => await [],
  },
});

// Top level await is allowed in Deno
console.log(await museumController.getAll());
