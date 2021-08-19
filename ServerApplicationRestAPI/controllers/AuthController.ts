import {
  bold,
  compareSync,
  create as JWTCreate,
  hashSync,
  RouterContext,
  yellow,
} from "../deps.ts";
import User from "../db/models/User.ts";

class AuthController {
  login = async (ctx: RouterContext) => {
    try {
      const { value } = ctx.request.body({ type: "json" });
      const { email, password } = await value;
      if (!email || !password) {
        ctx.response.status = 422;
        ctx.response.body = {
          message: "Please check whether you have provided email or/and not",
        };
        return;
      }

      const user: any = await User.findOne({ email });
      if (user) {
        // @ts-ignore
        const valid = compareSync(password, user?.password);
        if (valid) {
          // Generate a JSONWebToken if the login credentials are correct.

          // !TODO: Set the expiration time properly here, as of now test data supplied
          const token = await JWTCreate(
            { alg: "HS512", typ: "JWT" },
            {
              iss: user.email,
              exp: new Date().getTime() + 60 * 60 * 1000,
            },
            Deno.env.get("JWT_SECRET")!,
          );
          console.log("[LOGIN TOKEN:  ", yellow(bold(token)), " ]");
          ctx.response.body = {
            message: "Login Successful",
            id: user._id,
            name: user.name,
            email: user.email,
            "auth-token": token,
          };
        } else {
          ctx.response.status = 400; // HTTP 404 - Bad Request (For invalid credentials)
          ctx.response.body = {
            message: "Invalid Credential",
          };
          return;
        }
      } else {
        ctx.response.status = 400; // HTTP 404 - Bad Request (For invalid credentials)
        ctx.response.body = {
          message: "Incorrect email.",
        };
        return;
      }
    } catch (error) {
      console.error("[ERROR]", error);
    }
  };

  register = async (ctx: RouterContext) => {
    try {
      const { value } = ctx.request.body({ type: "json" });
      const { name, email, password } = await value; // Getting the request body
      /* console.log(name);
			console.log(email);
			console.log(password); */

      const user = await User.findOne({ email });
      if (user) {
        ctx.response.status = 409;
        ctx.response.body = { message: "EMail is already used." };
        return;
      } else {
        const hashedPassword = hashSync(password);
        const insertUser = new User({
          name,
          email,
          password: hashedPassword,
        });
        const insertedId = await insertUser.save();
        ctx.response.status = 201;
        ctx.response.body = {
          id: insertedId,
          name: insertUser.name,
          email: insertUser.email,
        };
        console.log(
          "[DB RESPONSE]: ",
          `INSERTED INTO DATABASE, _id: ${insertedId}`,
          typeof insertedId,
        );
      }
    } catch (error) {
      console.log("[ERROR]", error);
    }
  };
}

const authController = new AuthController();
export default authController;
