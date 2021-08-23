import { Controller as MuseumController } from "./museums/controller.ts";

const museumController = new MuseumController({
  museumRepository: {
    getAll: async () => [],
  },
});
// Top level await is allowed in Deno
console.log(await museumController.getAll());
