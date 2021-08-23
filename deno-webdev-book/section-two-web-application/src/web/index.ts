import { serve, Application } from "../deps.ts";
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
    const app = new Application();
    app.use(({ response }) => {
      response.body = "Hello World";
    });

    app.addEventListener("listen", ({ hostname }) => {
      console.log(
        `[ APPLICATION RUNNING AT http://${hostname || "localhost"}:${PORT}]`
      );
    });
    await app.listen({ hostname: "0.0.0.0", port: PORT });
  } else {
    console.error("[ NETWORK ACCESS WAS NOT ALLOWED ]");
    Deno.exit();
  }
}
