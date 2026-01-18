export class RegistUserCommand {
  constructor(
    readonly email: string,
    readonly password: string,
    readonly name: string,
  ) {}
}
