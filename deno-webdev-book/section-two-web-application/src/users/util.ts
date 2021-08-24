import { createHash, encodeToString } from "../deps.ts";

export const hashWithSalt = (password: string, salt: string) =>
  createHash("sha512").update(`${password}${salt}`).toString();

export const generateSalt = () => {
  const arr = new Uint8Array(64);
  crypto.getRandomValues(arr);

  return encodeToString(arr);
};
