export class UpdateUserEmailCommand {
  constructor(
    readonly userId: string,
    readonly email: string,
  ) {}
}
