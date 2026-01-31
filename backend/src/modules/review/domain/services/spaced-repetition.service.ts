/**
 * エビングハウスの忘却曲線に基づくスペースドリピティション（間隔反復）サービス
 *
 * 忘却曲線の基本原理:
 * - 学習直後から記憶は急速に減衰する
 * - 適切なタイミングで復習することで記憶の定着率が向上する
 * - 復習間隔を徐々に延ばすことで長期記憶に定着する
 */

import { ReviewGrade } from '../value-objects/review-grade';

export interface ReviewHistory {
  readonly reviewedAt: Date;
  readonly grade: ReviewGrade;
  readonly intervalDays: number;
}

export interface NextReviewResult {
  readonly nextReviewDate: Date;
  readonly intervalDays: number;
  readonly easeFactor: number;
  readonly repetitionCount: number;
}

/**
 * SM-2アルゴリズムをベースにしたスペースドリピティション計算
 * (SuperMemoアルゴリズムの簡略版)
 */
export class SpacedRepetitionService {
  // デフォルトのEase Factor (難易度係数)
  private static readonly DEFAULT_EASE_FACTOR = 2.5;
  // 最小のEase Factor
  private static readonly MIN_EASE_FACTOR = 1.3;
  // 最大のEase Factor
  private static readonly MAX_EASE_FACTOR = 3.0;

  // 初期復習間隔（日数）
  private static readonly INITIAL_INTERVALS = {
    first: 1, // 1日後
    second: 3, // 3日後
  };

  /**
   * 次の復習タイミングを計算する
   *
   * @param grade - 今回の復習結果（AGAIN/HARD/GOOD）
   * @param currentRepetitionCount - 現在の復習回数（0から開始）
   * @param currentEaseFactor - 現在のEase Factor
   * @param lastIntervalDays - 前回の復習間隔（日数）
   * @param reviewedAt - 復習を行った日時（デフォルト: 現在時刻）
   * @returns 次の復習情報
   */
  static calculateNextReview(
    grade: ReviewGrade,
    currentRepetitionCount: number = 0,
    currentEaseFactor: number = this.DEFAULT_EASE_FACTOR,
    lastIntervalDays: number = 0,
    reviewedAt: Date = new Date(),
  ): NextReviewResult {
    let newEaseFactor = currentEaseFactor;
    let newRepetitionCount = currentRepetitionCount;
    let intervalDays: number;

    // Ease Factorの調整
    newEaseFactor = this.adjustEaseFactor(currentEaseFactor, grade);

    if (grade === ReviewGrade.AGAIN) {
      // AGAINの場合: 復習回数をリセットし、1日後に再復習
      newRepetitionCount = 0;
      intervalDays = 1;
    } else {
      // HARD または GOOD の場合
      newRepetitionCount = currentRepetitionCount + 1;

      if (newRepetitionCount === 1) {
        // 初回復習後
        intervalDays = this.INITIAL_INTERVALS.first;
      } else if (newRepetitionCount === 2) {
        // 2回目復習後
        intervalDays = this.INITIAL_INTERVALS.second;
      } else {
        // 3回目以降: 前回間隔 × Ease Factor
        intervalDays = Math.round(lastIntervalDays * newEaseFactor);
      }

      // HARDの場合は間隔を短めに調整
      if (grade === ReviewGrade.HARD) {
        intervalDays = Math.max(1, Math.round(intervalDays * 0.8));
      }
      intervalDays = Math.max(1, intervalDays);
    }

    // 最大間隔は365日に制限
    intervalDays = Math.min(intervalDays, 365);

    const nextReviewDate = this.addDays(reviewedAt, intervalDays);

    return {
      nextReviewDate,
      intervalDays,
      easeFactor: newEaseFactor,
      repetitionCount: newRepetitionCount,
    };
  }

  /**
   * 履歴から次の復習タイミングを計算する
   *
   * @param histories - 過去の復習履歴（古い順）
   * @param latestGrade - 今回の復習結果
   * @param reviewedAt - 復習を行った日時
   * @returns 次の復習情報
   */
  static calculateFromHistory(
    histories: ReviewHistory[],
    latestGrade: ReviewGrade,
    reviewedAt: Date = new Date(),
  ): NextReviewResult {
    let easeFactor = this.DEFAULT_EASE_FACTOR;
    let repetitionCount = 0;
    let lastIntervalDays = 0;

    // 履歴からEase FactorとRepetition Countを再計算
    for (const history of histories) {
      if (history.grade === ReviewGrade.AGAIN) {
        repetitionCount = 0;
      } else {
        repetitionCount++;
      }
      easeFactor = this.adjustEaseFactor(easeFactor, history.grade);
      lastIntervalDays = history.intervalDays;
    }

    return this.calculateNextReview(
      latestGrade,
      repetitionCount,
      easeFactor,
      lastIntervalDays,
      reviewedAt,
    );
  }

  /**
   * 初回学習時の復習スケジュールを生成する
   * エビングハウスの忘却曲線に基づく推奨タイミング
   *
   * @param learnedAt - 学習した日時
   * @returns 推奨される復習日時の配列
   */
  static generateInitialSchedule(learnedAt: Date = new Date()): Date[] {
    // エビングハウスの忘却曲線に基づく復習タイミング
    // 1日後、3日後、7日後、14日後、30日後、60日後
    const intervals = [1, 3, 7, 14, 30, 60];

    return intervals.map((days) => this.addDays(learnedAt, days));
  }

  /**
   * Ease Factorを調整する
   */
  private static adjustEaseFactor(
    currentEaseFactor: number,
    grade: ReviewGrade,
  ): number {
    let adjustment: number;

    switch (grade) {
      case ReviewGrade.AGAIN:
        adjustment = -0.3;
        break;
      case ReviewGrade.HARD:
        adjustment = -0.15;
        break;
      case ReviewGrade.GOOD:
        adjustment = 0.1;
        break;
      default:
        adjustment = 0;
    }

    const newEaseFactor = currentEaseFactor + adjustment;

    // 範囲内に収める
    return Math.max(
      this.MIN_EASE_FACTOR,
      Math.min(this.MAX_EASE_FACTOR, newEaseFactor),
    );
  }

  /**
   * 日付に日数を加算する
   */
  private static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * 記憶の保持率を計算する（参考値）
   * エビングハウスの忘却曲線: R = e^(-t/S)
   *
   * @param daysSinceReview - 最後の復習からの経過日数
   * @param stability - 記憶の安定性（復習回数に応じて増加）
   * @returns 保持率（0〜1）
   */
  static calculateRetention(
    daysSinceReview: number,
    stability: number = 1,
  ): number {
    // 安定性が高いほど忘却が遅くなる
    const adjustedStability = Math.max(0.5, stability);
    const safeDays = Math.max(0, daysSinceReview);
    return Math.exp(-safeDays / adjustedStability);
  }
}
