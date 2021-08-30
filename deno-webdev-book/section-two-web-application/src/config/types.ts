import { Algorithm } from "../deps.ts";

export type Configuration = {
  web: { port: number };
  cors: { allowedOrigins: string[] };
  https: { key: string; certificate: string };
  jwt: { algorithm: Algorithm; expirationTime: number; key: string };
  mongoDb: {
    clusterURI: string;
    database: string;
    username: string;
    password: string;
  };
};
