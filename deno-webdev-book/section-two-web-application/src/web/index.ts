import { serve } from "../../deps.ts";

const PORT = 3000;
const networkRequest: Deno.PermissionDescriptor = {
  name: "net",
  host: `0.0.0.0:${PORT}`,
};
await Deno.permissions.request(networkRequest);
if ((await Deno.permissions.query(networkRequest)).state === "granted") {
  const server = serve({ port: PORT });

  console.log(`[ Server running at PORT: ${PORT} ]`);
  for await (const request of server) {
    request.respond({ body: "Museums API", status: 200 });
  }
}
