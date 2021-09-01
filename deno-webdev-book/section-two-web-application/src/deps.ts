export { serve } from "https://deno.land/std@0.105.0/http/server.ts";
export { Application, Router } from "https://deno.land/x/oak@v9.0.0/mod.ts";
export type { RouterMiddleware } from "https://deno.land/x/oak@v9.0.0/mod.ts";
export { createHash } from "https://deno.land/std@0.105.0/hash/mod.ts";

export { encodeToString } from "https://deno.land/std@0.83.0/encoding/hex.ts";
export type { Algorithm } from "https://raw.githubusercontent.com/PacktPublishing/Deno-Web-Development/master/Chapter06/jwt-auth/mod.ts";
export { Repository as AuthRepository } from "https://raw.githubusercontent.com/PacktPublishing/Deno-Web-Development/master/Chapter06/jwt-auth/mod.ts";
export { jwtMiddleware } from "https://x.nest.land/oak-middleware-jwt@2.0.0/mod.ts";
export {
  MongoClient,
  Collection,
  Database,
} from "https://deno.land/x/mongo@v0.25.0/mod.ts";
export { oakCors } from "https://deno.land/x/cors@v1.2.2/oakCors.ts";
export { parse } from "https://deno.land/std@0.105.0/encoding/yaml.ts";

// Loading the environment variables (https://deno.land/x/dotenv@v3.0.0#auto-loading)
import "https://deno.land/x/dotenv@v3.0.0/load.ts";

// TESTING
export * as t from "https://deno.land/std@0.105.0/testing/asserts.ts";
