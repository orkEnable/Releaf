"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Menu, ArrowLeft, Check, CloudOff } from "lucide-react";
import { useState, useEffect, useId, useRef, useReducer } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useMemoDraft, STORAGE_KEY, type MemoDraft } from "@/hooks/useMemoDraft";

// localStorageから下書きを取得
function getStoredDraft(): MemoDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const drafts = JSON.parse(stored) as Record<string, MemoDraft>;
    const newDrafts = Object.values(drafts).filter((d) =>
      d.id.startsWith("new_")
    );
    if (newDrafts.length === 0) return null;
    return newDrafts.sort((a, b) => b.updatedAt - a.updatedAt)[0];
  } catch {
    return null;
  }
}

// メモ状態の型
type MemoState = {
  title: string;
  content: string;
  memoId: string;
  saveStatus: "idle" | "saving" | "saved" | "offline";
  isInitialized: boolean;
};

type MemoAction =
  | { type: "RESTORE_DRAFT"; draft: MemoDraft }
  | { type: "INITIALIZE" }
  | { type: "SET_TITLE"; title: string }
  | { type: "SET_CONTENT"; content: string }
  | { type: "SET_MEMO_ID"; memoId: string }
  | { type: "SET_SAVE_STATUS"; status: MemoState["saveStatus"] };

function memoReducer(state: MemoState, action: MemoAction): MemoState {
  switch (action.type) {
    case "RESTORE_DRAFT":
      return {
        ...state,
        title: action.draft.title,
        content: action.draft.content,
        memoId: action.draft.id,
        saveStatus: "offline",
        isInitialized: true,
      };
    case "INITIALIZE":
      return { ...state, isInitialized: true };
    case "SET_TITLE":
      return {
        ...state,
        title: action.title,
        saveStatus:
          state.saveStatus === "saved" || state.saveStatus === "offline"
            ? "idle"
            : state.saveStatus,
      };
    case "SET_CONTENT":
      return {
        ...state,
        content: action.content,
        saveStatus:
          state.saveStatus === "saved" || state.saveStatus === "offline"
            ? "idle"
            : state.saveStatus,
      };
    case "SET_MEMO_ID":
      return { ...state, memoId: action.memoId };
    case "SET_SAVE_STATUS":
      return { ...state, saveStatus: action.status };
    default:
      return state;
  }
}

export default function NewMemoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tempId = useId();
  const [state, dispatch] = useReducer(memoReducer, {
    title: "",
    content: "",
    memoId: `new_${tempId}`,
    saveStatus: "idle",
    isInitialized: false,
  });

  const { title, content, memoId, saveStatus, isInitialized } = state;

  const { saveDraft } = useMemoDraft(memoId);

  // saveDraftをrefで保持（依存配列から外すため）
  const saveDraftRef = useRef(saveDraft);
  useEffect(() => {
    saveDraftRef.current = saveDraft;
  }, [saveDraft]);

  // マウント後に一度だけ下書きを復元
  useEffect(() => {
    const draft = getStoredDraft();
    if (draft) {
      dispatch({ type: "RESTORE_DRAFT", draft });
    } else {
      dispatch({ type: "INITIALIZE" });
    }
  }, []);

  // ハイブリッド自動保存（title/contentの変更時のみ発火）
  useEffect(() => {
    // 初期化完了前は何もしない
    if (!isInitialized) {
      return;
    }

    // タイトルとコンテンツが両方空の場合は何もしない
    if (!title.trim() && !content.trim()) {
      return;
    }

    // ハイブリッド保存を実行（refから最新のsaveDraftを使用）
    saveDraftRef.current(title, content, {
      onSaving: () => dispatch({ type: "SET_SAVE_STATUS", status: "saving" }),
      onSaved: (newMemoId) => {
        dispatch({ type: "SET_SAVE_STATUS", status: "saved" });
        if (newMemoId) {
          dispatch({ type: "SET_MEMO_ID", memoId: newMemoId });
        }
      },
      onError: () => dispatch({ type: "SET_SAVE_STATUS", status: "offline" }),
    });
  }, [title, content, isInitialized]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_TITLE", title: e.target.value });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: "SET_CONTENT", content: e.target.value });
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* モバイルオーバーレイ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* サイドバー */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <AppSidebar />
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* ヘッダー */}
        <header className="flex items-center justify-between gap-3 p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Link href="/dashboard/memos">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="font-semibold text-foreground">新規メモ</h1>
          </div>

          {/* 自動保存ステータス */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {saveStatus === "saving" && (
              <>
                <div className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                <span>保存中...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="w-3.5 h-3.5 text-primary" />
                <span>保存済み</span>
              </>
            )}
            {saveStatus === "offline" && (
              <>
                <CloudOff className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-amber-500">ローカル保存</span>
              </>
            )}
          </div>
        </header>

        {/* エディターエリア */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto p-6">
            {/* タイトル */}
            <input
              type="text"
              placeholder="タイトルを入力..."
              value={title}
              onChange={handleTitleChange}
              aria-label="メモのタイトル"
              className="w-full text-2xl sm:text-3xl font-bold text-foreground placeholder:text-muted-foreground/50 bg-transparent border-none outline-none mb-6"
            />

            {/* 区切り線 */}
            <div className="border-b border-border mb-6" />

            {/* 本文エリア */}
            <textarea
              placeholder="メモを書き始めましょう..."
              value={content}
              onChange={handleContentChange}
              aria-label="メモの本文"
              className="w-full min-h-[calc(100vh-220px)] text-base leading-relaxed text-foreground placeholder:text-muted-foreground/50 bg-transparent border-none outline-none resize-none"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
