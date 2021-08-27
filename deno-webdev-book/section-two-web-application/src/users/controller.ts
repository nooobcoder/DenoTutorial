import type { UserRepository } from "./index.ts";
import { userToUserDto } from "./adapter.ts";
import { generateSalt, hashWithSalt } from "./util.ts";
import {
  RegisterPayload,
  UserController,
  LoginPayload,
  User,
} from "./types.ts";
interface ControllerDependencies {
  userRepository: UserRepository;
}

export class Controller implements UserController {
  userRepository: UserRepository;

  constructor({ userRepository }: ControllerDependencies) {
    this.userRepository = userRepository;
  }

  private getHashedUser(username: string, password: string) {
    const salt = generateSalt();
    const user = {
      username,
      hash: hashWithSalt(password, salt),
      salt,
    };

    return user;
  }

  private async comparePassword(password: string, user: User) {
    const hashedPassword = hashWithSalt(password, user.salt);

    return hashedPassword === user.hash
      ? await Promise.resolve(true)
      : await Promise.reject(false);
  }

  public async register({ username, password }: RegisterPayload) {
    // Logic to register users

    if (await this.userRepository.exists(username))
      return Promise.reject(new Error("Username already exists"));

    // Create a user with a random hash and a salt
    const createdUser = await this.userRepository.create(
      this.getHashedUser(username, password)
    );

    return userToUserDto(createdUser);
  }

  public async login({ username, password }: LoginPayload) {
    try {
      const user = await this.userRepository.getByUsername(username);

      await this.comparePassword(password, user);

      return { user: userToUserDto(user) };
    } catch (e) {
      throw new Error("Username and/or password combination is incorrect.");
    }
  }
}
