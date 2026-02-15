"use client";

import { useCallback, useEffect, useRef } from "react";
import { saveMemo } from "@/app/dashboard/memos/actions";

export interface MemoDraft {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export const STORAGE_KEY = "memo_drafts";

/**
 * メモの下書きをlocalStorageで管理するフック
 * - 即時にlocalStorageへ保存（データ消失防止）
 * - デバウンスしてAPIへ保存（サーバー負荷軽減）
 */
export function useMemoDraft(memoId: string) {
  // memoIdをrefで保持（常に最新の値を参照するため）
  const memoIdRef = useRef(memoId);
  useEffect(() => {
    memoIdRef.current = memoId;
  }, [memoId]);

  const apiSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isApiCallInProgressRef = useRef(false);
  const pendingSaveRef = useRef<{
    title: string;
    content: string;
    options?: {
      onSaving?: () => void;
      onSaved?: (newMemoId?: string) => void;
      onError?: (error: Error) => void;
    };
  } | null>(null);

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
    return drafts[memoIdRef.current] || null;
  }, [getAllDrafts]);

  // localStorageに即時保存
  // memoIdRefを使用して常に最新のIDで保存
  const saveDraftLocal = useCallback(
    (title: string, content: string) => {
      if (typeof window === "undefined") return;

      const currentMemoId = memoIdRef.current;
      const drafts = getAllDrafts();
      drafts[currentMemoId] = {
        id: currentMemoId,
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
    [getAllDrafts]
  );

  // localStorageから下書きを削除（API保存成功後に呼ぶ）
  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;

    const drafts = getAllDrafts();
    delete drafts[memoIdRef.current];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    } catch (e) {
      console.error("Failed to clear draft from localStorage:", e);
    }
  }, [getAllDrafts]);

  // APIへデバウンス保存（新規作成時はIDを返す）
  // memoIdRefを使用して常に最新のIDでAPIを呼び出す
  const saveDraftToApi = useCallback(
    async (title: string, content: string): Promise<string | null> => {
      const currentMemoId = memoIdRef.current;
      const result = await saveMemo(currentMemoId, title, content);
      if (!result.success) {
        throw new Error(result.error || "保存に失敗しました");
      }
      // 新規作成時は新しいIDを返す、更新時はnull
      return result.memoId ?? null;
    },
    [] // memoIdRefを使用するため依存配列は空
  );

  // saveDraftをrefで保持（pending save再試行時に最新の関数を使用するため）
  const saveDraftRef = useRef<typeof saveDraftImpl | null>(null);

  // ハイブリッド保存: localStorage即時 + APIデバウンス
  const saveDraftImpl = useCallback(
    (
      title: string,
      content: string,
      options?: {
        onSaving?: () => void;
        onSaved?: (newMemoId?: string) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      // 1. localStorageに即時保存
      saveDraftLocal(title, content);

      // 2. 既存のAPIタイマーをクリア
      if (apiSaveTimeoutRef.current) {
        clearTimeout(apiSaveTimeoutRef.current);
      }

      // 3. API呼び出し中なら保留リクエストとして保存
      if (isApiCallInProgressRef.current) {
        pendingSaveRef.current = { title, content, options };
        return;
      }

      // 4. デバウンスしてAPI保存（1.5秒後）
      apiSaveTimeoutRef.current = setTimeout(async () => {
        isApiCallInProgressRef.current = true;
        options?.onSaving?.();

        try {
          const newMemoId = await saveDraftToApi(title, content);
          // API保存成功後、localStorageの下書きをクリア
          clearDraft();
          // 新規作成時は新しいIDを渡す
          options?.onSaved?.(newMemoId ?? undefined);
        } catch (error) {
          options?.onError?.(error as Error);
        } finally {
          isApiCallInProgressRef.current = false;

          // 保留中のリクエストがあれば処理（refから最新の関数を使用）
          if (pendingSaveRef.current) {
            const pending = pendingSaveRef.current;
            pendingSaveRef.current = null;
            // 次のティックで実行（スタックオーバーフロー防止）
            setTimeout(() => {
              saveDraftRef.current?.(pending.title, pending.content, pending.options);
            }, 0);
          }
        }
      }, 1500);
    },
    [saveDraftLocal, saveDraftToApi, clearDraft]
  );

  // saveDraftImplをrefに保持
  useEffect(() => {
    saveDraftRef.current = saveDraftImpl;
  }, [saveDraftImpl]);

  // 外部公開用のsaveDraft（常に最新のsaveDraftImplを呼び出す）
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
      saveDraftImpl(title, content, options);
    },
    [saveDraftImpl]
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
