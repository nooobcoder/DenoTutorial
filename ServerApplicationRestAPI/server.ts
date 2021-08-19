import { Application, Router, RouterContext } from "./deps.ts";
import { staticFileMiddleWare } from "./middlewares/staticFileMiddleware.ts";
import router from "./router.ts";
const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());
app.use(staticFileMiddleWare);
app.addEventListener("listen", ({ hostname, port, secure }): void => {
  console.log(
    `Listening on ${secure ? "https" : "http"}://${hostname ||
      "localhost"}:${port} `,
  );
});

app.addEventListener("error", (e) => {
  console.log(e.error);
});
await app.listen({ port: 1035 });
