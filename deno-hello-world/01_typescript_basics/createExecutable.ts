// Write the current date to sample.txt after 5 seconds delay
setTimeout(() => {
  Deno.writeTextFile("./sample.txt", new Date().toString());
}, 5000);

// To create an executable of the file
// deno install -n executable-name --allow-write createExecutable.ts
// This creates the executable in the path where deno is installed.
