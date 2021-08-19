import {
	serve,
	Server,
	ServerRequest,
} from "https://deno.land/std@0.93.0/http/server.ts";

const s: Server = serve({ port: 1035 });
console.log(`[SERVER LISTENING ON PORT 1035]`);

for await (const req: ServerRequest of s) {
	if (req.url === "/hello") req.respond({ body: "Hello Page" });
	else if (req.url === "/about") req.respond({ body: "About Page" });
	else req.respond({ body: "Home Page" });
}
