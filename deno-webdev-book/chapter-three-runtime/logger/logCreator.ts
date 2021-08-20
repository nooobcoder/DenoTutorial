import { Buffer } from "./deps.js";
await Deno.permissions.request({ name: "read" });

// Create encoding and decoding streams
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const fileContents = await Deno.readFile("./example-logs.txt");
const logLines = decoder.decode(fileContents).split("\n"); // Split logs to an array

const start = (buffer: Buffer) =>
  setInterval(() => {
    const randomLine = Math.floor(
      Math.min(Math.random() * 1000, logLines.length)
    );
    buffer.write(encoder.encode(logLines[randomLine]));
  }, 100);

export default start;
