import { UserRepository, User, CreateUser } from "../types.ts";
import { Database, Collection } from "../../deps.ts";

interface RepositoryDependencies {
  storage: Database;
}

export class Repository implements UserRepository {
  storage: Collection<User>;

  constructor({ storage }: RepositoryDependencies) {
    this.storage = storage.collection<User>("users");
  }

  async create(user: CreateUser) {
    const userWithCreatedAt = { ...user, createdAt: new Date() };
    await this.storage.insertOne({ ...user });

    return userWithCreatedAt;
  }

  async exists(username: string) {
    return Boolean(await this.storage.count({ username }));
  }

  async getByUsername(username: string) {
    const user = await this.storage.findOne({ username });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}
