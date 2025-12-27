import { RepositoryError } from './repository-error';

export class RepositoryNotFoundError extends RepositoryError {
  readonly type = 'REPOSITORY_NOT_FOUND';

  constructor(message = 'Resource not found', cause?: unknown) {
    super(message, cause);
  }
}
