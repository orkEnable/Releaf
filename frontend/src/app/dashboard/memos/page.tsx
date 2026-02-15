"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Menu,
  Search,
  Plus,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getMemos, Memo } from "./actions";

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "たった今";
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
  return `${Math.floor(diffDays / 30)}ヶ月前`;
}

function getPreview(content: string, maxLength: number = 80): string {
  const trimmed = content.replace(/\n/g, " ").trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength) + "...";
}

export default function MemosPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMemos() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getMemos();
        if (result.success && result.memos) {
          setMemos(result.memos);
        } else {
          setError(result.error || "メモの取得に失敗しました");
        }
      } catch {
        setError("メモの取得中にエラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    }
    fetchMemos();
  }, []);

  const filteredMemos = memos.filter((memo) => {
    const matchesSearch =
      memo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memo.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <AppSidebar />
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* モバイルヘッダー */}
        <header className="lg:hidden flex items-center gap-3 p-4 border-b border-border bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-foreground">メモ一覧</h1>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          {/* ヘッダー */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">メモ一覧</h1>
            <p className="text-muted-foreground mt-1">
              {isLoading ? "読み込み中..." : `${filteredMemos.length}件のメモ`}
            </p>
          </div>

          {/* 検索 */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="メモを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* ローディング */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* エラー */}
          {error && (
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {/* メモ一覧 */}
          {!isLoading && !error && (
            <div className="space-y-3">
              {filteredMemos.map((memo) => (
                <Link
                  key={memo.id}
                  href={`/dashboard/memos/${memo.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer group"
                >
                  <div className="w-1.5 h-12 rounded-full bg-primary" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground truncate">
                        {memo.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {getPreview(memo.content)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(memo.updatedAt)}
                      </span>
                      {memo.reviewCount > 0 && (
                        <span className="text-primary">
                          {memo.reviewCount}回復習
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          )}

          {!isLoading && !error && filteredMemos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {memos.length === 0
                  ? "メモがありません。新しいメモを作成しましょう！"
                  : "メモが見つかりませんでした"}
              </p>
            </div>
          )}
        </div>

        {/* フローティング新規メモボタン（サイドバー開放時は非表示） */}
        {!sidebarOpen && (
          <Link href="/dashboard/memos/new">
            <Button
              size="icon"
              className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg z-50"
            >
              <Plus className="w-6 h-6" />
              <span className="sr-only">新規メモ</span>
            </Button>
          </Link>
        )}
      </main>
    </div>
  );
}
