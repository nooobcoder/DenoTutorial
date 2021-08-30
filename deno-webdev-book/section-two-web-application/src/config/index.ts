import type { Configuration } from "./types.ts";
import { parse } from "../deps.ts";

const load = async (env = "dev"): Promise<Configuration> => {
  const configuration: Configuration = parse(
    await Deno.readTextFile(`./config/config.${env}.yaml`)
  ) as Configuration;

  return {
    ...configuration,
    mongoDb: {
      ...configuration.mongoDb,
      username: Deno.env.get("MONGODB_USERNAME")!,
      password: Deno.env.get("MONGODB_PASSWORD")!,
    },
    jwt: { ...configuration.jwt, key: Deno.env.get("JWT_KEY")! },
  };
};

export { load };
