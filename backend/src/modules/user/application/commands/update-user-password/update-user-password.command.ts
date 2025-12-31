export class UpdateUserPasswordCommand {
  constructor(
    readonly userId: string,
    readonly passwordHash: string,
  ) {}
}
