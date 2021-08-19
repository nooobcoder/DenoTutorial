import { usersCollection } from "../mongo.ts";

export default class User {
  public _id: string;
  public name: string;
  public email: string;
  public password: string;

  constructor({ id = "", name = "", email = "", password = "" }) {
    this._id = id;
    this.name = name;
    this.email = email;
    this.password = password;
  }

  static findOne(params: Object) {
    return usersCollection.findOne(params); // Return the promise
  }

  async save() {
    const insertId = await usersCollection.insertOne({
      name: this.name,
      email: this.email,
      password: this.password,
    });
    return insertId;
  }
}
