import { Memo } from './entities/memo.entity';

export interface MemoRepository {
  create(memo: Memo): Promise<void>;
  update(memo: Memo): Promise<void>;
  findById(id: string): Promise<Memo | null>;
  findByUserId(userId: string): Promise<Memo[]>;
  delete(id: string): Promise<void>;
}
