"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Menu, ArrowLeft, Check, CloudOff } from "lucide-react";
import { useState, useEffect, useMemo, useId, useRef } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useMemoDraft, type MemoDraft } from "@/hooks/useMemoDraft";

// localStorageから下書きを取得（初期化用）
function getInitialDraft(): MemoDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("memo_drafts");
    if (!stored) return null;
    const drafts = JSON.parse(stored) as Record<string, MemoDraft>;
    // 新規メモの下書きを探す（new_で始まるIDのうち最新のもの）
    const newDrafts = Object.values(drafts).filter((d) =>
      d.id.startsWith("new_")
    );
    if (newDrafts.length === 0) return null;
    return newDrafts.sort((a, b) => b.updatedAt - a.updatedAt)[0];
  } catch {
    return null;
  }
}

export default function NewMemoPage() {
  // 遅延初期化: 初回レンダリング時にlocalStorageから読み込む
  const initialDraft = useMemo(() => getInitialDraft(), []);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [title, setTitle] = useState(() => initialDraft?.title ?? "");
  const [content, setContent] = useState(() => initialDraft?.content ?? "");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "offline"
  >(() => (initialDraft ? "offline" : "idle"));

  // 新規メモ用のID（復元された下書きがあればそのID、なければ新規生成）
  // API保存後に実際のIDに更新される
  const tempId = useId();
  const [memoId, setMemoId] = useState(
    () => initialDraft?.id ?? `new_${tempId}`
  );

  const { saveDraft } = useMemoDraft(memoId);

  // saveDraftをrefで保持（依存配列から外すため）
  const saveDraftRef = useRef(saveDraft);
  useEffect(() => {
    saveDraftRef.current = saveDraft;
  }, [saveDraft]);

  // 初回レンダリングをスキップするためのref
  const isFirstRender = useRef(true);

  // ハイブリッド自動保存（title/contentの変更時のみ発火）
  useEffect(() => {
    // 初回レンダリングはスキップ（復元直後の保存を防ぐ）
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // タイトルとコンテンツが両方空の場合は何もしない
    if (!title.trim() && !content.trim()) {
      return;
    }

    // ハイブリッド保存を実行（refから最新のsaveDraftを使用）
    saveDraftRef.current(title, content, {
      onSaving: () => setSaveStatus("saving"),
      onSaved: (newMemoId) => {
        setSaveStatus("saved");
        // 新規作成時は返されたIDに更新（以降はPUTで更新される）
        if (newMemoId) {
          setMemoId(newMemoId);
        }
      },
      onError: () => setSaveStatus("offline"),
    });
  }, [title, content]); // saveDraftを依存配列から削除

  // 入力時にステータスをリセットし、state更新
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (saveStatus === "saved" || saveStatus === "offline") {
      setSaveStatus("idle");
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (saveStatus === "saved" || saveStatus === "offline") {
      setSaveStatus("idle");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
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
              className="w-full text-2xl sm:text-3xl font-bold text-foreground placeholder:text-muted-foreground/50 bg-transparent border-none outline-none mb-6"
            />

            {/* 区切り線 */}
            <div className="border-b border-border mb-6" />

            {/* 本文エリア */}
            <textarea
              placeholder="メモを書き始めましょう..."
              value={content}
              onChange={handleContentChange}
              className="w-full min-h-[calc(100vh-220px)] text-base leading-relaxed text-foreground placeholder:text-muted-foreground/50 bg-transparent border-none outline-none resize-none"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
