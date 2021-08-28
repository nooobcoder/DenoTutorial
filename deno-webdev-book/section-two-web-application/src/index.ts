import {
  Controller as UserController,
  Repository as UserRepository,
} from "./users/index.ts";

import { AuthRepository, Algorithm } from "./deps.ts";
const authRepository = new AuthRepository({
  configuration: {
    algorithm: "HS512",
    key: "my-jwt-key",
    tokenExpirationInSeconds: 120,
  },
});

import { MongoClient } from "./deps.ts";
const client = new MongoClient();
await client.connect(
  `mongodb://admin:adminadmin@192.168.0.118:27017/?authSource=admin&retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true&ssl=false`
);
const db = client.database("getting-started-with-deno");

const userRepository = new UserRepository({storage:db});
const userController = new UserController({ userRepository, authRepository });
const authConfiguration = {
  algorithm: "HS512" as Algorithm,
  key: "my-jwt-key",
  tokenExpirationInSeconds: 120,
};

import {
  Controller as MuseumController,
  Repository as MuseumRepository,
} from "./museums/index.ts";

import { createServer } from "./web/index.ts";

const museumRepository: MuseumRepository = new MuseumRepository();
// Adding a fixture to our "database" (JS Map being used as a database)
museumRepository.storage.set("1fbdd2a9-1b97-46e0-b450-62819e5772ff", {
  id: "1fbdd2a9-1b97-46e0-b450-62819e5772ff",
  name: "The Louvre",
  description:
    "The world's largest art museum and a historic monument in Paris, France.",
  location: { lat: "48.860294", lng: "2.33862" },
});

const museumController: MuseumController = new MuseumController({
  museumRepository,
});

// Top level await is allowed in Deno
// console.log(await museumController.getAll());

createServer({
  configuration: {
    PORT: 3000,
    authorization: {
      key: authConfiguration.key,
      algorithm: authConfiguration.algorithm,
    },
  },
  museum: museumController,
  user: userController,
});
