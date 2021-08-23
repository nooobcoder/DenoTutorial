import { serve } from "../../deps.ts";
import { MuseumController } from "../museums/index.ts";
interface CreateServerDependencies {
  configuration: { PORT: number };
  museum: MuseumController;
}

export async function createServer({
  configuration: { PORT = 3000 },
  museum,
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
      const { url, method } = request;
      switch (method) {
        case "GET":
          switch (url) {
            case "/api/museums":
              console.log(await museum.getAll());
              request.respond({
                body: JSON.stringify({ museums: await museum.getAll() }),
              });
              break;

            default:
              request.respond({ body: "Museums API", status: 200 });
          }
      }
    }

    return;
  } else {
    console.error("[ NETWORK ACCESS WAS NOT ALLOWED ]");
    Deno.exit();
  }
}
