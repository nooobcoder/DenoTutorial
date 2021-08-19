// Extract command line arguments in deno and do some useful task
/* const fileName = Deno.args[0];
console.log(fileName);

const path = Deno.cwd() + `/${fileName}`;

for await (const directory of Deno.readDir(path)) {
	console.log(directory.name);
} */

/* const exists = async (path: string): Promise<boolean | undefined> => {
	try {
		return (await Deno.lstat(path)) ? true : undefined;
	} catch (error) {
		return error instanceof Deno.errors.NotFound ? false : error;
	}
};

let fileExists = await exists("1.txt");
console.log(fileExists);
fileExists = await exists("sample.txt");
console.log(fileExists);
 */

// Create a directory
// await Deno.mkdir("test");
await Deno.rename("test", "new-test");
