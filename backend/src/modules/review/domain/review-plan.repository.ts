import { ReviewPlan } from './entities/review-plan.entity';

export interface ReviewPlanRepository {
  create(reviewPlan: ReviewPlan): Promise<void>;
  update(reviewPlan: ReviewPlan): Promise<void>;
  findById(id: string): Promise<ReviewPlan | null>;
  findByMemoId(memoId: string): Promise<ReviewPlan[]>;
  findPendingByMemoId(memoId: string): Promise<ReviewPlan[]>;
  delete(id: string): Promise<void>;
  deleteByMemoId(memoId: string): Promise<void>;
}
