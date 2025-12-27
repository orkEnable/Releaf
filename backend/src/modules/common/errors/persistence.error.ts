// common/errors/persistence.error.ts
import { RepositoryError } from './repository-error';

export class RepositoryPersistenceError extends RepositoryError {
  readonly type = 'REPOSITORY_PERSISTENCE_ERROR';

  constructor(message = 'Persistence failed', cause?: unknown) {
    super(message, cause);
  }
}
