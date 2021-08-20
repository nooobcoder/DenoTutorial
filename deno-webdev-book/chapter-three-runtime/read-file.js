const readPerm = { name: "read" };
const writePerm = { name: "write" };

await Deno.permissions.request(readPerm);
await Deno.permissions.request(writePerm);
const { state } = await Deno.permissions.query(readPerm);
const { state: writeState } = await Deno.permissions.query(writePerm);

if (state === "granted" && writeState === "granted") {
  const decoder = new TextDecoder();
  const content = await Deno.readFile("./sample-sentence.txt");

  console.log(decoder.decode(content));

  // await Deno.copyFile("./sample-sentence.txt", "./using-copy-command.txt");
} else if (state === "denied" || writeState === "denied")
  console.log("Please grant required permissions");
