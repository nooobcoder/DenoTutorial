import type { UserRepository } from "./index.ts";
import { userToUserDto } from "./adapter.ts";
import { generateSalt, hashWithSalt } from "./util.ts";
import { RegisterPayload, UserController } from "./types.ts";
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
}