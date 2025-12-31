export class RegistUserCommand {
  constructor(
    readonly email: string,
    readonly passwordHash: string,
    readonly name: string,
  ) {}
}
