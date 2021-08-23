import {
  Controller as MuseumController,
  Repository as MuseumRepository,
} from "./museums/index.ts";

import { createServer } from "./web/index.ts";

const museumRepository: MuseumRepository = new MuseumRepository();
const museumController: MuseumController = new MuseumController({
  museumRepository: {
    getAll: async () => await [],
  },
});

// Top level await is allowed in Deno
console.log(await museumController.getAll());

// Adding a fixture to our "database" (JS Map being used as a database)
museumRepository.storage.set("1fbdd2a9-1b97-46e0-b450-62819e5772ff", {
  id: "1fbdd2a9-1b97-46e0-b450-62819e5772ff",
  name: "The Louvre",
  description:
    "The world's largest art museum     and a historic monument in Paris, France.",
  location: { lat: "48.860294", lng: "2.33862" },
});
console.log(await museumRepository.getAll());

createServer({ configuration: { PORT: 3000 } });
