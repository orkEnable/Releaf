export class UpdateUserPasswordCommand {
  constructor(
    readonly userId: string,
    readonly password: string,
  ) {}
}
