##  Tutorial for Deno from various sources

  

###  Setup

  

1.  [Shell Autocomplete](https://deno.land/manual@v1.7.5/getting_started/setup_your_environment#shell-autocomplete)

2.  [Shell Autocomplete ZSH + oh-my-zsh](https://github.com/denodev/oh-my-zsh-deno#installation)

> Use `deno info` to list information where Deno caches the dependencies and other cache related information.

#### Aliases

| Alias    | Command         | Descripton                                                                   |
|:------   |:----------------|:-----------------------------------------------------------------------------|
| `denoa`  | `deno run -A`   | BRun a program given a filename or url to the module, allow all permissions  |
| `denob`  | `deno bundle`   | Bundle module and dependencies into single file                              |
| `denoc`  | `deno cache`    | Cache the dependencies                                                       |
| `denod`  | `deno doc`      | Show documentation for a module                                              |
| `denoe`  | `deno eval`     | Eval script                                                                  |
| `denof`  | `deno fmt`      | Format source files                                                          |
| `denoi`  | `deno install`  | Install script as an executable                                              |
| `denol`  | `deno lint`     | Lint source files                                                            |
| `denor`  | `deno run`      | Run a program given a filename or url to the module                          |
| `denot`  | `deno test`     | Run tests                                                                    |
| `denoup` | `deno upgrade`  | Upgrade deno executable to newest version                                    |

---
### Quick Hacks

**Caching without running the code**

To make sure you have a local copy of your code's dependencies without having to run it, you can use the following command:
`$ deno cache hello-http-server.js`

This will do the exact same thing that Deno does before running your code; the only difference is that it doesn't run. Due to this, we can establish some parallelism between the deno cache command and what **npm install** does on Node.

### Managing dependencies centrally
Create a file called deps.js and add our dependencies there, exporting the ones  we need:

`export { serve } from "https://deno.land/std@0.83.0/http/server.ts";`

### Generating a lock file from **deps.js**

`$ deno cache --lock=lock.json --lock-write deps.js`

### Installing dependencies with a lock file
`$ deno cache --reload --lock=lock.json deps.js`

It is also possible to use the **--lock flag** with the run command to enable runtime verification:

`$ deno run --lock=lock.json --allow-net hello-http-server.js`

## Import Maps (Beta)
> This feature is currently unstable, so it must be enabled using the --unstable flag.

## Installing Utility Scripts
There are utility programs we write once and those that we use multiple times. Sometimes, to facilitate reusing them, we just copy those scripts from project to project. For others, we keep them in a GitHub repository and keep going there to get them. The ones we use the most might need to be wrapped in a shell script, added it /usr/local/bin (on *nix systems) and made usable across our system.
For this, Deno provides the install command. 
This command wraps a program into a thin shell script and puts it into the installation bin directory. The permissions for the script are set at the time of its installation and never asked for again:

Append `--root` flag to set a custom location for installing the script.

`deno install --allow-net --root ./ --unstable hello-http-server.js`
OR (for remote scripts)
`deno install --allow-net --allow-read https://deno.land/std@0.83.0/http/file_server.ts`

## Deno Permissions
[Permissions](https://deno.land/manual/getting_started/permissions) are a very crucial part of Deno. 
To disregard all permission requirements use **-A** or the **--allow-all** flag.

## Bundling Code 
> Bundling the code generates a file that is dependency free. 
> Use `deno bundle hello-http-server.js bundle.js` and  `deno run --allow-net bundle.js` to get a clearer picture

In the previous chapter, when we presented Deno, we elected bundling code as an exciting feature for many reasons. This feature has enormous potential, and we will explore this in more detail in Chapter 7, HTTPS, Extracting Configuration, and Deno in the Browser. But since we're exploring the CLI here, we'll get to know the appropriate command. 
It is called bundle, and it bundles code into a single, self-contained ES module. 
Bundled code that doesn't depend on the Deno namespace can also run in the browser with `<script type="module">` and in Node.js

## Compiling 
When Deno was initially launched, Dahl stated that one of its objectives was to be able to ship Deno code as a single binary, something similar to what golang does, from day one. This is very similar from the work that nexe (https://github.com/nexe/nexe) or pkg (https://github.com/vercel/pkg) do for Node. 
This is different from the bundle feature, where a JavaScript file is generated. What happens when you compile Deno code to a binary is that all the runtime and code is included in that binary, making it self-sustainable. Once you've compiled it, you can just send this binary anywhere, and you'll be able to execute it.

    $ deno compile --unstable get-current-time.js 
      Bundle file:///home/coder/project/DenoTutorial/deno-webdev-book/chapter-two-toolchain/get-current-time.js
      Compile file:///home/coder/project/DenoTutorial/deno-webdev-book/chapter-two-toolchain/get-current-time.js
      Emit get-current-time

## Dynamic Permissions (permissions at runtime)

[Read more](https://deno.land/manual@v1.13.1/runtime/permission_apis#permission-apis)

When writing Deno programs ourselves, it's very common that we know the required permissions beforehand. However, when writing or executing code that might or might not need some permissions or writing an interactive CLI utility, it might not make sense to ask for all permissions at once. That's what dynamic permissions are for.

Dynamic permissions allow programs to ask for permissions as they are needed, allowing whoever is executing the code to give or deny specific permissions interactively.

This is a feature that is still unstable and thus its APIs can change, but I think it's still worth mentioning, because of the amount of potential it enables.

      // Dynamic permissions - ask for set of permissions during runtime
      await Deno.permissions.request({ name: "read", path });
---