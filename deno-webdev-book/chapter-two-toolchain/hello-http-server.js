import { serve } from "./deps.js";

for await (const req of serve(":3000")) req.respond({ body: "Hello Deno" });
