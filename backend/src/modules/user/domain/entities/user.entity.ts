export class User {
  private constructor(
    readonly id: string,
    readonly email: string,
    readonly passwordHash: string,
    readonly name: string,
    readonly createdAt: Date | null,
    readonly updatedAt: Date | null,
    readonly deletedAt: Date | null,
  ) {}

  static create(
    id: string,
    email: string,
    passwordHash: string,
    name: string,
  ): User {
    return new User(id, email, passwordHash, name, null, null, null);
  }

  static from(
    id: string,
    email: string,
    passwordHash: string,
    name: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date,
  ): User {
    return new User(
      id,
      email,
      passwordHash,
      name,
      createdAt,
      updatedAt,
      deletedAt,
    );
  }

  update(email: string, passwordHash: string, name: string): User {
    return new User(
      this.id,
      email,
      passwordHash,
      name,
      this.createdAt,
      this.updatedAt,
      this.deletedAt,
    );
  }

  updateEmail(email: string): User {
    return new User(
      this.id,
      email,
      this.passwordHash,
      this.name,
      this.createdAt,
      this.updatedAt,
      this.deletedAt,
    );
  }

  updatePasswordHash(passwordHash: string): User {
    return new User(
      this.id,
      this.email,
      passwordHash,
      this.name,
      this.createdAt,
      this.updatedAt,
      this.deletedAt,
    );
  }

  delete(): User {
    return new User(
      this.id,
      this.email,
      this.passwordHash,
      this.name,
      this.createdAt,
      this.updatedAt,
      new Date(),
    );
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
