export class User {
  private constructor(
    readonly id: string,
    readonly email: string,
    readonly passwordHash: string,
    readonly name: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(
    id: string,
    email: string,
    passwordHash: string,
    name: string,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    return new User(id, email, passwordHash, name, createdAt, updatedAt);
  }

  static from(
    id: string,
    email: string,
    passwordHash: string,
    name: string,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    return new User(id, email, passwordHash, name, createdAt, updatedAt);
  }
}
