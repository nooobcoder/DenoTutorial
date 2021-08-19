import { Bson, RouterContext, verify } from "../deps.ts";
import User from "../db/models/User.ts";
import "https://deno.land/x/dotenv/load.ts";

// TODO: Improve the error handling when the token is not valid.
const validateJWT = async (token: string): Promise<Object> => {
  const payload = await verify(
    token,
    Deno.env.get("JWT_SECRET") as string,
    "HS512",
  );
  return payload;
};

export default async (ctx: RouterContext, next: Function) => {
  const header = ctx.request.headers;
  const authHeader = header.get("authorization");
  if (!authHeader) {
    ctx.response.body = {
      message: "You are not authorised to access this endpoint.",
    };
    return;
  } else {
    const jwt = authHeader.split(" ")[1]; // Extract the auth token
    if (!jwt) {
      ctx.response.status = 401;
      return;
    } else {
      // console.log(jwt);
      const tokenPayload = await validateJWT(jwt);
      //@ts-ignore
      const currentUser = await User.findOne({ email: tokenPayload?.iss });
      ctx.state.user = currentUser;
      if (tokenPayload) await next();
    }
  }
};
