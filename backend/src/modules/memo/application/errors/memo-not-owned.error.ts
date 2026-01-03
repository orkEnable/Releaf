export class MemoNotOwnedError extends Error {
  readonly memoId: string;
  readonly userId: string;

  constructor(memoId: string, userId: string) {
    super(`このメモを操作する権限がありません: memoId:${memoId}`);
    this.name = 'MemoNotOwnedError';
    this.memoId = memoId;
    this.userId = userId;
  }
}
