export class UserAlreadyDeletedError extends Error {
  constructor(userId: string) {
    super(`ユーザーは既に削除されています: ${userId}`);
    this.name = 'UserAlreadyDeletedError';
  }
}
