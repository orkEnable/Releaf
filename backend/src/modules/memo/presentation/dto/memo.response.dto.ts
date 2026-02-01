import { Memo } from '../../domain/entities/memo.entity';

export class MemoResponseDto {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly reviewCount: number;
  readonly lastReviewedAt: Date | null;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;

  constructor(memo: Memo) {
    this.id = memo.id;
    this.title = memo.title;
    this.content = memo.content;
    this.reviewCount = memo.reviewCount;
    this.lastReviewedAt = memo.lastReviewedAt;
    this.createdAt = memo.createdAt;
    this.updatedAt = memo.updatedAt;
  }

  static fromEntity(memo: Memo): MemoResponseDto {
    return new MemoResponseDto(memo);
  }

  static fromEntities(memos: Memo[]): MemoResponseDto[] {
    return memos.map((memo) => MemoResponseDto.fromEntity(memo));
  }
}
