import { load as loadConfiguration } from "./config/index.ts";
const config = await loadConfiguration();

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
await client.connect(`mongodb://admin:adminadmin@${config.mongoDb.clusterURI}`);
const db = client.database(config.mongoDb.database);

const userRepository = new UserRepository({ storage: db });
const userController = new UserController({ userRepository, authRepository });
const authConfiguration = {
  algorithm: config.jwt.algorithm as Algorithm,
  key: "my-jwt-key",
  tokenExpirationInSeconds: config.jwt.expirationTime,
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

createServer({
  configuration: {
    PORT: config.web.port,
    authorization: {
      key: authConfiguration.key,
      algorithm: authConfiguration.algorithm,
    },
    allowedOrigins: config.cors.allowedOrigins,
    secure: true,
    certFile: config.https.certificate,
    keyFile: config.https.key,
  },
  museum: museumController,
  user: userController,
});
