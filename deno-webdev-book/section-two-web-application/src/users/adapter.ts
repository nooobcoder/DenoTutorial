import type { User, UserDto } from "./types.ts";

export const userToUserDto = ({ username, createdAt }: User): UserDto => ({
  username,
  createdAt,
});
