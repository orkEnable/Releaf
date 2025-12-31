export class UserEmailAlreadyExistsError extends Error {
  constructor() {
    super('登録済みのメールアドレスです。');
    this.name = 'UserEmailAlreadyExistsError';
  }
}
