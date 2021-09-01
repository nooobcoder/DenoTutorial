import type { Museum } from "../museums/types.ts";
import type { LoginPayload, RegisterPayload, UserDto } from "../users/types.ts";

interface config {
  baseURL: string;
}

const headers = new Headers();
headers.set("content-type", "application/json");

const getClient = (config: config) => {
  let token: string | null = null;
  return {
    register: async ({
      username,
      password,
    }: RegisterPayload): Promise<UserDto> =>
      await (
        await fetch(`${config.baseURL}/api/users/register`, {
          body: JSON.stringify({ username, password }),
          method: "POST",
          headers,
        })
      ).json(),
    login: ({
      username,
      password,
    }: LoginPayload): Promise<{ user: UserDto; token: string }> => {
      return fetch(`${config.baseURL}/api/login`, {
        body: JSON.stringify({ username, password }),
        method: "POST",
        headers,
      })
        .then((response) => {
          if (response.status < 300) {
            return response.json();
          }

          throw response.json();
        })
        .then((response) => {
          token = response.token;

          return response;
        });
    },
    getMuseums: async (): Promise<{ museums: Museum[] }> => {
      const authenticatedHeaders = new Headers();
      authenticatedHeaders.set("authorization", `Bearer ${token}`);
      const r = await fetch(`${config.baseURL}/api/museums`, {
        headers: authenticatedHeaders,
      });
      return await r.json();
    },
  };
};

export { getClient };
