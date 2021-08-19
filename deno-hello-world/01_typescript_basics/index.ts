// Read current working directory      --alow-read
// console.log(`[CURRENT DIRECTORY]:  ${Deno.cwd()}`);

// Read file content and output
/* const content = Deno.readTextFileSync("./read.txt");
console.log(content); */

// Write content into file
/* Deno.writeTextFile("./read.txt", "Test data from Deno runtime.\n", {
	append: true,
}); */

// Environmental access
// Deno.env.get("HOME");

// Allow network access

/* console.log(
	await fetch(
		"https://jsonplaceholder.typicode.com/todos/"
	).then((response) => response.json())
); */
