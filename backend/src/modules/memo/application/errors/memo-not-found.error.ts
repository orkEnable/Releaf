export class MemoNotFoundApplicationError extends Error {
  readonly memoId: string;

  constructor(memoId: string) {
    super(`メモが見つかりません: memoId:${memoId}`);
    this.name = 'MemoNotFoundError';
    this.memoId = memoId;
  }
}
