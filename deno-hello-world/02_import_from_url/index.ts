import { green, underline } from "https://deno.land/std/fmt/colors.ts";

console.log(`This is ${green("green")} text`);
console.log(`This is ${underline("underlined")} text`);

// deno bundle index.ts file-name.ts
// deno info index.ts  - This would show the dependency tree of the file and other information of the script.

// deno run --reload - This forces to re-download all dependencies in the deno runtime
