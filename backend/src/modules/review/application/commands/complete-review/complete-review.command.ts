import { ReviewGrade } from 'src/modules/review/domain/value-objects/review-grade';

export class CompleteReviewCommand {
  constructor(
    readonly reviewPlanId: string,
    readonly memoId: string,
    readonly grade: ReviewGrade,
  ) {}
}
