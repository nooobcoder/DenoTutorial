export type User = {
  username: string;
  hash: string;
  salt: string;
  createdAt: Date;
};

export type CreateUser = Pick<User, "username" | "hash" | "salt">;
export interface UserRepository {
  create: (user: CreateUser) => Promise<User>;
  exists: (username: string) => Promise<boolean>;
}

// Data Transfer Object (DTO) => https://en.wikipedia.org/wiki/Data_transfer_object
export type UserDto = Pick<User, "createdAt" | "username">;
