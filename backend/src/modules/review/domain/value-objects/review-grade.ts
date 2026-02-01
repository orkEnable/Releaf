/**
 * 復習の評価グレード
 * Prismaスキーマの ReviewGrade enum に対応
 */
export enum ReviewGrade {
  /** もう一度 - 覚えていない、すぐに復習が必要 */
  AGAIN = 'AGAIN',
  /** まあまあ - 思い出すのに時間がかかった */
  HARD = 'HARD',
  /** 覚えた - スムーズに思い出せた */
  GOOD = 'GOOD',
}

export function isValidReviewGrade(value: string): value is ReviewGrade {
  return Object.values(ReviewGrade).includes(value as ReviewGrade);
}

export function parseReviewGrade(value: string): ReviewGrade {
  if (!isValidReviewGrade(value)) {
    throw new Error(`Invalid review grade: ${value}`);
  }
  return value;
}
