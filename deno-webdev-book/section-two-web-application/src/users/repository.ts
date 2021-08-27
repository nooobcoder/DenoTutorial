import type { CreateUser, User, UserRepository } from "./types.ts";

export class Repository implements UserRepository {
  private storage = new Map<User["username"], User>();

  create(user: CreateUser) {
    const userWithCreatedAt: User = { ...user, createdAt: new Date() };
    this.storage.set(user.username, { ...userWithCreatedAt });

    return userWithCreatedAt;
  }

  exists(username: string) {
    return Boolean(this.storage.get(username));
  }

  async getByUsername(username: string) {
    const user = this.storage.get(username);

    if (!user) throw new Error("User not found");

    return await user;
  }
}
