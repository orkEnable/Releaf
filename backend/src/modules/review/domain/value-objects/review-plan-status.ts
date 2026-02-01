/**
 * 復習計画のステータス
 * Prismaスキーマの ReviewPlanStatus enum に対応
 */
export enum ReviewPlanStatus {
  /** 未完了 - まだ復習していない */
  PENDING = 'PENDING',
  /** 完了 - 復習済み */
  DONE = 'DONE',
  /** スキップ - 復習をスキップした */
  SKIPPED = 'SKIPPED',
}

export function isValidReviewPlanStatus(
  value: string,
): value is ReviewPlanStatus {
  return Object.values(ReviewPlanStatus).includes(value as ReviewPlanStatus);
}
