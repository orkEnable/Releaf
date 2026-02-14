"use client";

import { useCallback, useEffect, useRef } from "react";
import { saveMemo } from "@/app/dashboard/memos/actions";

export interface MemoDraft {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

const STORAGE_KEY = "memo_drafts";

/**
 * メモの下書きをlocalStorageで管理するフック
 * - 即時にlocalStorageへ保存（データ消失防止）
 * - デバウンスしてAPIへ保存（サーバー負荷軽減）
 */
export function useMemoDraft(memoId: string) {
  const apiSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // localStorageから全下書きを取得
  const getAllDrafts = useCallback((): Record<string, MemoDraft> => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  // 特定のメモの下書きを取得
  const getDraft = useCallback((): MemoDraft | null => {
    const drafts = getAllDrafts();
    return drafts[memoId] || null;
  }, [memoId, getAllDrafts]);

  // localStorageに即時保存
  const saveDraftLocal = useCallback(
    (title: string, content: string) => {
      if (typeof window === "undefined") return;

      const drafts = getAllDrafts();
      drafts[memoId] = {
        id: memoId,
        title,
        content,
        updatedAt: Date.now(),
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
      } catch (e) {
        console.error("Failed to save draft to localStorage:", e);
      }
    },
    [memoId, getAllDrafts]
  );

  // localStorageから下書きを削除（API保存成功後に呼ぶ）
  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;

    const drafts = getAllDrafts();
    delete drafts[memoId];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    } catch (e) {
      console.error("Failed to clear draft from localStorage:", e);
    }
  }, [memoId, getAllDrafts]);

  // APIへデバウンス保存（新規作成時はIDを返す）
  const saveDraftToApi = useCallback(
    async (title: string, content: string): Promise<string | null> => {
      console.log("[useMemoDraft] Saving to API...", { memoId, title, content });
      const result = await saveMemo(memoId, title, content);
      console.log("[useMemoDraft] API result:", result);
      if (!result.success) {
        throw new Error(result.error || "保存に失敗しました");
      }
      // 新規作成時は新しいIDを返す、更新時はnull
      return result.memoId ?? null;
    },
    [memoId]
  );

  // ハイブリッド保存: localStorage即時 + APIデバウンス
  const saveDraft = useCallback(
    (
      title: string,
      content: string,
      options?: {
        onSaving?: () => void;
        onSaved?: (newMemoId?: string) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      console.log("[useMemoDraft] saveDraft called", { title, content });

      // 1. localStorageに即時保存
      saveDraftLocal(title, content);
      console.log("[useMemoDraft] Saved to localStorage");

      // 2. 既存のAPIタイマーをクリア
      if (apiSaveTimeoutRef.current) {
        clearTimeout(apiSaveTimeoutRef.current);
      }

      // 3. デバウンスしてAPI保存（1.5秒後）
      apiSaveTimeoutRef.current = setTimeout(async () => {
        options?.onSaving?.();

        try {
          const newMemoId = await saveDraftToApi(title, content);
          // API保存成功後、localStorageの下書きをクリア
          clearDraft();
          // 新規作成時は新しいIDを渡す
          options?.onSaved?.(newMemoId ?? undefined);
        } catch (error) {
          console.error("[useMemoDraft] API error:", error);
          options?.onError?.(error as Error);
        }
      }, 1500);
    },
    [saveDraftLocal, saveDraftToApi, clearDraft]
  );

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (apiSaveTimeoutRef.current) {
        clearTimeout(apiSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    getDraft,
    saveDraft,
    saveDraftLocal,
    clearDraft,
    getAllDrafts,
  };
}
