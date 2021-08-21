import { serve, red, readAll, resolve, fromFileUrl } from "./deps.js";

interface PostIt {
  title: string;
  id: string;
  body: string;
  createdAt: Date;
}

const PORT: number = 3000 as const;
const HOST = "0.0.0.0" as const;
const PROTOCOL: "http" | "https" = "http";

const postIts: Record<PostIt["id"], PostIt> = {
  "3209ebc7-b3b4-4555-88b1-b64b33d507ab": {
    title: "Read more",
    body: "PacktPub books",
    id: "3209ebc7-b3b4-4555-88b1-b64b33d507ab",
    createdAt: new Date(),
  },
  "a1afee4a-b078-4eff-8ca6-06b3722eee2c": {
    title: "Finish book",
    body: "Deno Web Development",
    id: "3209ebc7-b3b4-4555-88b1-b64b33d507ab ",
    createdAt: new Date(),
  },
};

// Using runtime permissions (--unstable)
await Deno.permissions.request({ name: "net", host: HOST });
await Deno.permissions.request({ name: "read" });
if (
  (await Deno.permissions.query({ name: "net", host: HOST })).state ===
    "granted" &&
  (await Deno.permissions.query({ name: "read" })).state === "granted"
) {
  const server = serve({ port: PORT, hostname: HOST });

  console.log(`SERVER RUNNING AT PORT ${PORT}`);
  for await (const req of server) {
    const url = new URL(`${PROTOCOL}://${HOST}${req.url}`);
    const headers = new Headers();
    const pathWithMethod = `${req.method} ${url.pathname}`;

    headers.set("content-type", "application-json");
    switch (pathWithMethod) {
      case "GET /": {
        console.log(import.meta.url);

        const file = await Deno.readFile(
          resolve(fromFileUrl(import.meta.url), "..", "index.html")
        );
        const htmlHeaders = new Headers();
        htmlHeaders.set("content-type", "text/html");
        req.respond({
          headers: htmlHeaders,
          body: new TextDecoder().decode(file),
        });
        break;
      }
      case "GET /api/post-its": {
        req.respond({ headers, body: JSON.stringify({ postIts }) });
        break;
      }
      case "POST /api/post-its": {
        const unintDecoder = new TextDecoder();
        const body = unintDecoder.decode(await readAll(req.body));
        const JSONParse = JSON.parse(body);
        const id = globalThis.crypto.randomUUID();

        postIts[id] = { ...JSONParse, id, createdAt: new Date() };

        console.log(postIts);
        req.respond({
          body: JSON.stringify(postIts[id]),
          status: 201,
          headers,
        });
        break;
      }
      default:
        req.respond({ body: "Invalid route", status: 404 });
    }
  }
} else {
  console.log(red("Network access, read access was not granted"));
}
