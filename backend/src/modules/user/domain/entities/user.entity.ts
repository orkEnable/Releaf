export class User {
  private constructor(
    readonly id: string,
    readonly email: string,
    readonly passwordHash: string,
    readonly name: string,
    readonly createdAt: Date | null,
    readonly updatedAt: Date | null,
  ) {}

  static create(
    id: string,
    email: string,
    passwordHash: string,
    name: string,
  ): User {
    return new User(id, email, passwordHash, name, null, null);
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

  update(email: string, passwordHash: string, name: string): User {
    return new User(
      this.id,
      email,
      passwordHash,
      name,
      this.createdAt,
      this.updatedAt,
    );
  }
}
