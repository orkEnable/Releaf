import { Memo } from './entities/memo.entity';

export interface MemoRepository {
  save(memo: Memo): Promise<void>;
  findById(id: string): Promise<Memo | null>;
  findAll(): Promise<Memo[]>;
  delete(id: string): Promise<void>;
}
