import { join } from "https://deno.land/std@0.105.0/path/mod.ts";
import { red } from "https://deno.land/std@0.105.0/fmt/colors.ts";

const [path = "."] = Deno.args;

// Dynamic permissions - ask for set of permissions during runtime (https://deno.land/manual@v1.13.1/runtime/permission_apis#permission-apis)
// Define permissions like this
const readPermission = { name: "read", path } as Deno.PermissionDescriptor;
await Deno.permissions.request(readPermission);
const { state } = await Deno.permissions.query(readPermission);

if (state === "granted") {
  for await (const item of Deno.readDir(path)) {
    if (item.isDirectory) {
      console.log(red(item.name));
    } else {
      console.log(item.name);
    }
  }

  for await (const dir of Deno.readDir(path)) {
    const fileInfo = await Deno.stat(join(path, dir.name));
    const modificationTime = fileInfo.mtime;

    const message = [
      fileInfo.size.toString().padEnd(4),
      `${modificationTime
        ?.getUTCMonth()
        .toString()
        .padStart(2)}/${modificationTime?.getUTCDay().toString().padEnd(2)}`,
      dir.name,
    ];

    console.log(message.join(""));
  }
} else
  console.log(
    "You did not allow the required permissions! Gracefully exiting now."
  );
