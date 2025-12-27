export abstract class RepositoryError extends Error {
  abstract readonly type: string;

  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
  }
}
