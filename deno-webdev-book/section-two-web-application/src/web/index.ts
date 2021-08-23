import { serve } from "../../deps.ts";

interface CreateServerDependencies {
  configuration: { PORT: number };
}

export async function createServer({
  configuration: { PORT = 3000 },
}: CreateServerDependencies) {
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

    return;
  } else {
    console.error("[ NETWORK ACCESS WAS NOT ALLOWED ]");
    Deno.exit();
  }
}
