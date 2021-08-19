import { MongoClient } from "../deps.ts";
import "https://deno.land/x/dotenv/load.ts";

const client = new MongoClient();
// await client.connect(
// 	"mongodb://admin:adminadmin@merncluster-shard-00-01.tzvum.mongodb.net:27017"
// );

const dbConnURI = `mongodb://${Deno.env.get("MONGODB_USER")}:${
  Deno.env.get(
    "MONGODB_PASSWORD",
  )
}@${Deno.env.get("MONGODB_URL")}:${Deno.env.get("MONGODB_PORT")}`;

await client
  .connect(dbConnURI)
  .then(() => {
    console.log("[CONNECTED TO DATABASE]");
  })
  .catch((err) => {
    console.error("[ERROR]", err);
  });

const db = client.database("deno_survey");
export const usersCollection = db.collection("users");
export const surveysCollection = db.collection("surveys");
export const questionCollection = db.collection("questions");
