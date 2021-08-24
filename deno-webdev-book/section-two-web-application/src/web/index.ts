import { Application, Router } from "../deps.ts";
import { MuseumController } from "../museums/index.ts";
import { UserController } from "../users/index.ts";

interface CreateServerDependencies {
  configuration: { PORT: number };
  museum: MuseumController;
  user: UserController;
}

const routerController = (
  router: Router,
  museum: MuseumController,
  user: UserController
) => {
  router.get(
    "/museums",
    async ({ response }) => (response.body = { museums: await museum.getAll() })
  );

  router.post("/users/register", async (ctx) => {
    const { username, password } = await ctx.request.body({ type: "json" })
      .value;

    if (!username || !password) {
      ctx.response.status = 400;
      return;
    }

    try {
      const createdUser = await user.register({ username, password });

      ctx.response.status = 201; // HTTP code for resource modified
      ctx.response.body = { user: createdUser };
    } catch ({ message }) {
      ctx.response.status = 400;
      ctx.response.body = { message };
    }
  });
};

export async function createServer({
  configuration: { PORT = 3000 },
  museum,
  user,
}: CreateServerDependencies) {
  const networkRequest: Deno.PermissionDescriptor = {
    name: "net",
    host: `0.0.0.0:${PORT}`,
  };
  await Deno.permissions.request(networkRequest);
  if ((await Deno.permissions.query(networkRequest)).state === "granted") {
    const app = new Application();

    const apiRouter = new Router({ prefix: "/api" });
    routerController(apiRouter, museum, user);

    app.addEventListener("listen", ({ hostname }) => {
      console.log(
        `[ APPLICATION RUNNING AT http://${hostname || "localhost"}:${PORT}]`
      );
    });
    app.addEventListener("error", ({ message }) =>
      console.log(`An Error occured: ${message}`)
    );

    // Invoking the router middlewares
    app.use(apiRouter.routes());
    app.use(apiRouter.allowedMethods());

    // GET /
    /* app.use(({ response }) => {
      response.body = "Hello World";
    }); */
    // This shall always remain at the bottom
    await app.listen({ hostname: "0.0.0.0", port: PORT });
  } else {
    console.error("[ NETWORK ACCESS WAS NOT ALLOWED ]");
    Deno.exit();
  }
}
