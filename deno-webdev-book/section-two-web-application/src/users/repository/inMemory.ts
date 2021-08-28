import type { CreateUser, User, UserRepository } from "../types.ts";

export class Repository implements UserRepository {
  private storage = new Map<User["username"], User>();
  async create(user: CreateUser) {
    const userWithCreatedAt = { ...user, createdAt: new Date() };
    this.storage.set(user.username, { ...userWithCreatedAt });

    return await userWithCreatedAt;
  }

  async exists(username: string) {
    return await Boolean(this.storage.get(username));
  }

  async getByUsername(username: string) {
    const user = this.storage.get(username);

    return (await user) || Promise.reject(new Error("User not found"));
  }
}
