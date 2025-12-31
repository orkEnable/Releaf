export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`ユーザーが見つかりません: ${userId}`);
    this.name = 'UserNotFoundError';
  }
}
