import { Application, Router } from "../deps.ts"
import { MuseumController } from "../museums/index.ts"

interface CreateServerDependencies {
  configuration: { PORT: number }
  museum: MuseumController
}

const routerController = ({ get }: Router, museum: MuseumController) => {
  get(
    "/museums",
    async ({ response }) => (response.body = { museums: await museum.getAll() })
  )
}

export async function createServer({
  configuration: { PORT = 3000 },
  museum,
}: CreateServerDependencies) {
  const networkRequest: Deno.PermissionDescriptor = {
    name: "net",
    host: `0.0.0.0:${PORT}`,
  }
  await Deno.permissions.request(networkRequest)
  if ((await Deno.permissions.query(networkRequest)).state === "granted") {
    const app = new Application()
    app.use(({ response }) => {
      response.body = "Hello World"
    })

    const apiRouter = new Router({ prefix: "/api" })
    routerController(apiRouter, museum)

    app.addEventListener("listen", ({ hostname }) => {
      console.log(
        `[ APPLICATION RUNNING AT http://${hostname || "localhost"}:${PORT}]`
      )
    })
    app.addEventListener("error", ({ message }) =>
      console.log(`An Error occured: ${message}`)
    )

    // Invoking the router middlewares
    app.use(apiRouter.routes())
    app.use(apiRouter.allowedMethods())

    // This shall always remain at the bottom
    await app.listen({ hostname: "0.0.0.0", port: PORT })
  } else {
    console.error("[ NETWORK ACCESS WAS NOT ALLOWED ]")
    Deno.exit()
  }
}
