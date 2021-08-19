import { Context, send } from "../deps.ts";
import { fileExists } from "../helpers.ts";

export const staticFileMiddleWare = async (ctx: Context, next: Function) => {
  const path = Deno.cwd() + `/assets${ctx.request.url.pathname}`;
  if (await fileExists(path)) {
    await send(ctx, ctx.request.url.pathname, {
      root: `${Deno.cwd()}/assets`,
    });
  } else {
    await next();
  }
};
