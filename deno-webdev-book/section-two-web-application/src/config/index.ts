import type { Configuration } from "./types.ts";
import { parse } from "../deps.ts";

const load = async (env = "dev"): Promise<Configuration> => {
  const configuration: Configuration = parse(
    await Deno.readTextFile(`./config/config.${env}.yaml`)
  ) as Configuration;

  return configuration;
};

export { load };
