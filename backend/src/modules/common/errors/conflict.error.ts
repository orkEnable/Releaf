import { RepositoryError } from './repository-error';

export class RepositoryConflictError extends RepositoryError {
  readonly type = 'REPOSITORY_CONFLICT';

  constructor(message = 'Resource conflict', cause?: unknown) {
    super(message, cause);
  }
}
