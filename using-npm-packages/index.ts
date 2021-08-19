import { createRequire } from "https://deno.land/std@0.93.0/node/module.ts";

const require = createRequire(import.meta.url);

const moment = require("moment");
console.log(moment().format("MMMM Do YYYY"));

const lodash = require("lodash");
console.log(lodash.defaults({ a: 1 }, { a: 3, b: 2 }));
