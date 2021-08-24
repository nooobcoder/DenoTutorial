import type { UserRepository } from "./index.ts";
import { userToUserDto } from "./adapter.ts";

type RegisterPayload = { username: string; password: string };
interface ControllerDependencies {
  userRepository: UserRepository;
}

const USER_HASH = `2dd2bf5bd804a17a5dcf979c38562b80ced396b16183fda086118b86236858e4
42237456e005b0b286aba5f711776bfbd3f39144391b43f541cd0203e2cf75fe
a90badd301475716f8ef0d55262125015e1ee55416c59849b6560d52d5206b11
77a5fd21c8d0ebd498d0d56030736ed55d5083ebbd5df7415d3d947280ec9227
c79fe8715b1fd9104cdf670a18948e3e20bef6e58166d9061ad166509655e1e2
462ac0943e0ba1eab151e06b5fcc66630f38d375e6c1429adbbf05e32a1eadf8
1bbe3f705d3afccb31cbbd0fcaa9ca801e17c303f33ae88e6002747cdf442c5f
8f51ad85cf5a6d2adfb0b9e4ad929a2687121a1f6e9ea75c9fa3d71d0f439403
6d155d4650608836339408ecd9318dd2bfc595e1034a0eb2f780c3f71d26bda0
92babf97d2f94d7af8c68928cf114fa36e8a0890baac92679564493341209cce`;

const USER_SALT = `g-Q-p-}-7-r-~-Q-7-?-@-a-F-F-1-A`;

export class Controller {
  userRepository: UserRepository;

  constructor({ userRepository }: ControllerDependencies) {
    this.userRepository = userRepository;
  }

  public async register({ username }: RegisterPayload) {
    // Logic to register users
    if (await this.userRepository.exists(username))
      return Promise.reject("Username already exists");

    // Create a user with a random hash and a salt
    const createdUser = await this.userRepository.create({
      username,
      hash: USER_HASH,
      salt: USER_SALT,
    });

    return userToUserDto(createdUser);
  }
}
