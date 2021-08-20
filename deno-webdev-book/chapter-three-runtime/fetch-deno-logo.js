// Top level await is allowed in Deno out of the box

const blob = await (await fetch("https://deno.land/logo.svg")).blob();
const img = await blob;
const base64 = btoa(await img.text());
console.log(`<html><img src="data:image/svg+xml;base64,${base64}" /></html>`);
