import { ReviewLog } from './entities/review-log.entity';

export interface ReviewLogRepository {
  create(reviewLog: ReviewLog): Promise<void>;
  findByMemoId(memoId: string): Promise<ReviewLog[]>;
  countByMemoId(memoId: string): Promise<number>;
}
