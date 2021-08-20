import { Buffer } from "./deps.js";
import start from "./logCreator.ts";

const processLogs = async () => {
  const destination = new Uint8Array(100);
  const readBytes = await buffer.read(destination); // Reading from the buffer stream
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  if (readBytes) {
    const read = decoder.decode(destination);

    if (read.includes("Tue"))
      await Deno.stdout.write(encoder.encode(`${read}\n`));
  }

  setTimeout(() => {
    processLogs();
  }, 10);
};

const buffer = new Buffer();
start(buffer);
await processLogs();
