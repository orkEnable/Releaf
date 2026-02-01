import { SpacedRepetitionService } from './spaced-repetition.service';
import { ReviewGrade } from '../value-objects/review-grade';

describe('SpacedRepetitionService', () => {
  describe('calculateNextReview', () => {
    const baseDate = new Date('2024-01-01T10:00:00Z');

    describe('初回復習（repetitionCount = 0）', () => {
      it('GOODの場合、1日後に次の復習を設定する', () => {
        const result = SpacedRepetitionService.calculateNextReview(
          ReviewGrade.GOOD,
          0,
          2.5,
          0,
          baseDate,
        );

        expect(result.intervalDays).toBe(1);
        expect(result.repetitionCount).toBe(1);
        expect(result.nextReviewDate).toEqual(new Date('2024-01-02T10:00:00Z'));
        expect(result.easeFactor).toBeCloseTo(2.6, 1);
      });

      it('HARDの場合、1日後に次の復習を設定する（短縮）', () => {
        const result = SpacedRepetitionService.calculateNextReview(
          ReviewGrade.HARD,
          0,
          2.5,
          0,
          baseDate,
        );

        expect(result.intervalDays).toBe(1);
        expect(result.repetitionCount).toBe(1);
        expect(result.easeFactor).toBeCloseTo(2.35, 1);
      });

      it('AGAINの場合、1日後に再復習しrepetitionCountをリセット', () => {
        const result = SpacedRepetitionService.calculateNextReview(
          ReviewGrade.AGAIN,
          0,
          2.5,
          0,
          baseDate,
        );

        expect(result.intervalDays).toBe(1);
        expect(result.repetitionCount).toBe(0);
        expect(result.easeFactor).toBeCloseTo(2.2, 1);
      });
    });

    describe('2回目復習（repetitionCount = 1）', () => {
      it('GOODの場合、3日後に次の復習を設定する', () => {
        const result = SpacedRepetitionService.calculateNextReview(
          ReviewGrade.GOOD,
          1,
          2.5,
          1,
          baseDate,
        );

        expect(result.intervalDays).toBe(3);
        expect(result.repetitionCount).toBe(2);
        expect(result.nextReviewDate).toEqual(new Date('2024-01-04T10:00:00Z'));
      });

      it('HARDの場合、間隔を短縮する', () => {
        const result = SpacedRepetitionService.calculateNextReview(
          ReviewGrade.HARD,
          1,
          2.5,
          1,
          baseDate,
        );

        // 3日 * 0.8 = 2.4 ≈ 2日
        expect(result.intervalDays).toBe(2);
        expect(result.repetitionCount).toBe(2);
      });
    });

    describe('3回目以降の復習', () => {
      it('GOODの場合、前回間隔 × Ease Factorで計算する', () => {
        const result = SpacedRepetitionService.calculateNextReview(
          ReviewGrade.GOOD,
          2,
          2.5,
          3,
          baseDate,
        );

        // 3日 * 2.6 (EF after GOOD) = 7.8 ≈ 8日
        expect(result.intervalDays).toBe(8);
        expect(result.repetitionCount).toBe(3);
      });

      it('Ease Factorが蓄積されて間隔が長くなる', () => {
        const result = SpacedRepetitionService.calculateNextReview(
          ReviewGrade.GOOD,
          5,
          2.8,
          30,
          baseDate,
        );

        // 30日 * 2.9 = 87日
        expect(result.intervalDays).toBe(87);
        expect(result.repetitionCount).toBe(6);
      });

      it('AGAINの場合、復習回数がリセットされる', () => {
        const result = SpacedRepetitionService.calculateNextReview(
          ReviewGrade.AGAIN,
          5,
          2.5,
          30,
          baseDate,
        );

        expect(result.intervalDays).toBe(1);
        expect(result.repetitionCount).toBe(0);
      });
    });

    describe('Ease Factor境界値', () => {
      it('最小値1.3を下回らない', () => {
        let easeFactor = 1.5;
        // 複数回AGAINを選択
        for (let i = 0; i < 5; i++) {
          const result = SpacedRepetitionService.calculateNextReview(
            ReviewGrade.AGAIN,
            0,
            easeFactor,
            1,
            baseDate,
          );
          easeFactor = result.easeFactor;
        }
        expect(easeFactor).toBeGreaterThanOrEqual(1.3);
      });

      it('最大値3.0を超えない', () => {
        let easeFactor = 2.9;
        // 複数回GOODを選択
        for (let i = 0; i < 5; i++) {
          const result = SpacedRepetitionService.calculateNextReview(
            ReviewGrade.GOOD,
            i,
            easeFactor,
            1,
            baseDate,
          );
          easeFactor = result.easeFactor;
        }
        expect(easeFactor).toBeLessThanOrEqual(3.0);
      });
    });

    describe('最大間隔制限', () => {
      it('365日を超えない', () => {
        const result = SpacedRepetitionService.calculateNextReview(
          ReviewGrade.GOOD,
          10,
          3.0,
          300,
          baseDate,
        );

        expect(result.intervalDays).toBeLessThanOrEqual(365);
      });
    });
  });

  describe('calculateFromHistory', () => {
    const baseDate = new Date('2024-01-15T10:00:00Z');

    it('履歴がない場合、初回として計算する', () => {
      const result = SpacedRepetitionService.calculateFromHistory(
        [],
        ReviewGrade.GOOD,
        baseDate,
      );

      expect(result.intervalDays).toBe(1);
      expect(result.repetitionCount).toBe(1);
    });

    it('履歴から状態を復元して計算する', () => {
      const histories = [
        {
          reviewedAt: new Date('2024-01-01'),
          grade: ReviewGrade.GOOD,
          intervalDays: 1,
        },
        {
          reviewedAt: new Date('2024-01-02'),
          grade: ReviewGrade.GOOD,
          intervalDays: 3,
        },
        {
          reviewedAt: new Date('2024-01-05'),
          grade: ReviewGrade.GOOD,
          intervalDays: 7,
        },
      ];

      const result = SpacedRepetitionService.calculateFromHistory(
        histories,
        ReviewGrade.GOOD,
        baseDate,
      );

      expect(result.repetitionCount).toBe(4);
      // 7日 * (2.5 + 0.1*4) = 7 * 2.9 ≈ 20日
      expect(result.intervalDays).toBeGreaterThan(7);
    });

    it('途中でAGAINがあった場合、回数がリセットされる', () => {
      const histories = [
        {
          reviewedAt: new Date('2024-01-01'),
          grade: ReviewGrade.GOOD,
          intervalDays: 1,
        },
        {
          reviewedAt: new Date('2024-01-02'),
          grade: ReviewGrade.GOOD,
          intervalDays: 3,
        },
        {
          reviewedAt: new Date('2024-01-05'),
          grade: ReviewGrade.AGAIN,
          intervalDays: 1,
        },
      ];

      const result = SpacedRepetitionService.calculateFromHistory(
        histories,
        ReviewGrade.GOOD,
        baseDate,
      );

      // AGAINでリセット後、GOODで1になる
      expect(result.repetitionCount).toBe(1);
    });
  });

  describe('generateInitialSchedule', () => {
    it('エビングハウスの忘却曲線に基づく6つの復習日を生成する', () => {
      const learnedAt = new Date('2024-01-01T10:00:00Z');
      const schedule =
        SpacedRepetitionService.generateInitialSchedule(learnedAt);

      expect(schedule).toHaveLength(6);
      expect(schedule[0]).toEqual(new Date('2024-01-02T10:00:00Z')); // 1日後
      expect(schedule[1]).toEqual(new Date('2024-01-04T10:00:00Z')); // 3日後
      expect(schedule[2]).toEqual(new Date('2024-01-08T10:00:00Z')); // 7日後
      expect(schedule[3]).toEqual(new Date('2024-01-15T10:00:00Z')); // 14日後
      expect(schedule[4]).toEqual(new Date('2024-01-31T10:00:00Z')); // 30日後
      expect(schedule[5]).toEqual(new Date('2024-03-01T10:00:00Z')); // 60日後
    });
  });

  describe('calculateRetention', () => {
    it('経過日数0の場合、保持率は1（100%）', () => {
      const retention = SpacedRepetitionService.calculateRetention(0, 1);
      expect(retention).toBeCloseTo(1, 5);
    });

    it('経過日数が増えると保持率が下がる', () => {
      const retention1Day = SpacedRepetitionService.calculateRetention(1, 1);
      const retention7Days = SpacedRepetitionService.calculateRetention(7, 1);

      expect(retention1Day).toBeGreaterThan(retention7Days);
      expect(retention1Day).toBeLessThan(1);
      expect(retention7Days).toBeLessThan(retention1Day);
    });

    it('安定性が高いほど保持率の低下が緩やか', () => {
      const lowStability = SpacedRepetitionService.calculateRetention(7, 1);
      const highStability = SpacedRepetitionService.calculateRetention(7, 5);

      expect(highStability).toBeGreaterThan(lowStability);
    });
  });
});
