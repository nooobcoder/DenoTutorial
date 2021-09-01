import { Application, Router, jwtMiddleware, oakCors } from "../deps.ts";
import type { Algorithm } from "../deps.ts";
import { MuseumController } from "../museums/index.ts";
import { UserController } from "../users/index.ts";
import { LoginPayload } from "../users/types.ts";
interface CreateServerDependencies {
  configuration: {
    PORT: number;
    authorization: { key: string; algorithm: Algorithm };
    allowedOrigins: Array<string>;
    secure: boolean;
    keyFile: string;
    certFile: string;
  };
  museum: MuseumController;
  user: UserController;
}

const routerController = (
  router: Router,
  museum: MuseumController,
  user: UserController
) => {
  // Defining handler for the frontend (client/index.ts)
  router.get("/client.js", async ({ request, response }) => {
    const { files, diagnostics } = await Deno.emit("./client/index.ts", {
      bundle: "classic",
    });

    if (!diagnostics.length) {
      response.type = "application/javascript";
      response.body = files["deno:///bundle.js"];
      return;
    }
  });

  const authenticated = () =>
    jwtMiddleware({
      algorithm: "HS512",
      key: "my-jwt-key",
    });

  router.get(
    "/museums",
    () => authenticated(),
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

  router.post("/login", async ({ request, response }) => {
    const { username, password }: LoginPayload = await request.body().value;

    try {
      const { user: loginUser, token } = await user.login({
        username,
        password,
      });
      response.body = { user: loginUser, token };
      response.status = 201;
    } catch (e) {
      response.body = { message: e?.message };
      response.status = 400;
    }
  });
};

export async function createServer({
  configuration: {
    PORT = 3000,
    // authorization,
    allowedOrigins,
    secure = false,
    // keyFile,
    // certFile,
  },
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
    app.use(
      oakCors({
        origin: allowedOrigins,
      })
    );
    // Middleware for request logging
    app.use(async ({ request, response }, next) => {
      await next();
      const rt = response.headers.get("X-Response-Time");
      console.log(`[LOG] < ${request.method}  ${request.url} - ${rt} >`);
    });

    // Middleware for 'X-Response-Time' header
    app.use(async ({ response }, next) => {
      const start = Date.now();
      await next();
      const ms = Date.now() - start;
      response.headers.set("X-Response-Time", `${ms}ms`);
    });

    const apiRouter = new Router({ prefix: "/api" });
    apiRouter.use(async (_, next) => {
      console.log("Request made to the Router middleware");
      await next();
    });
    routerController(apiRouter, museum, user);

    app.addEventListener("listen", ({ hostname }) => {
      console.log(
        `[ APPLICATION RUNNING AT ${secure ? "https" : "https"}://${
          hostname || "localhost"
        }:${PORT}]`
      );
    });
    app.addEventListener("error", ({ message }) =>
      console.log(`An Error occured: ${message}`)
    );

    // Invoking the router middlewares
    app.use(apiRouter.routes());
    app.use(apiRouter.allowedMethods());

    // This shall always remain at the bottom
    await app.listen({
      hostname: "192.168.0.118",
      port: PORT,
      // secure,
      // certFile,
      // keyFile,
    });
  } else {
    console.error("[ NETWORK ACCESS WAS NOT ALLOWED ]");
    Deno.exit();
  }
}
