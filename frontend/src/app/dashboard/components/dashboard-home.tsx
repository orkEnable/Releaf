"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  ChevronRight,
  Flame,
  Plus,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

// サンプルの復習データ
const reviewMemos = [
  {
    id: 1,
    title: "React 19の新機能",
    lastReviewed: "3日前",
  },
  {
    id: 2,
    title: "DDD Repository設計",
    lastReviewed: "5日前",
  },
  {
    id: 3,
    title: "CQRSの考え方",
    lastReviewed: "1週間前",
  },
];

export function DashboardHome() {
  const [quickMemo, setQuickMemo] = useState("");

  const totalReviewsToday = 3;
  const completedReviews = 1;
  const streakDays = 7;

  const handleQuickMemoSubmit = () => {
    if (quickMemo.trim()) {
      // メモを保存する処理
      setQuickMemo("");
    }
  };

  return (
    <div className="flex-1 p-6 overflow-auto bg-background">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">おかえりなさい</h1>
        <p className="text-muted-foreground mt-1">
          今日も復習を続けて、知識を定着させましょう
        </p>
      </div>

      {/* 復習ステータス */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">今日の復習</p>
                <p className="text-2xl font-bold text-foreground">
                  {completedReviews}
                  <span className="text-lg text-muted-foreground font-normal">
                    /{totalReviewsToday}
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{
                  width: `${(completedReviews / totalReviewsToday) * 100}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">連続記録</p>
                <p className="text-2xl font-bold text-foreground">
                  {streakDays}
                  <span className="text-lg text-muted-foreground font-normal ml-1">
                    日
                  </span>
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              素晴らしい! 続けていきましょう
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10">
                <Trophy className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">総復習回数</p>
                <p className="text-2xl font-bold text-foreground">
                  42
                  <span className="text-lg text-muted-foreground font-normal ml-1">
                    回
                  </span>
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">今週 +12回</p>
          </CardContent>
        </Card>
      </div>

      {/* 今日の復習 - メインセクション */}
      <Card className="border-primary/30 bg-card mb-8 overflow-hidden">
        <div className="bg-primary/5 border-b border-primary/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                今日の復習
              </h2>
              <p className="text-sm text-muted-foreground">
                {reviewMemos.length}件あります
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* 復習メモ一覧 */}
          <div className="space-y-3 mb-6">
            {reviewMemos.map((memo) => (
              <div
                key={memo.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {memo.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    最終復習: {memo.lastReviewed}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Link href="/dashboard/review">
            <Button className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground">
              今日の復習を始める
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* クイックメモ */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-secondary">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                クイックメモ
              </h2>
              <p className="text-sm text-muted-foreground">
                思いついたことをすぐにメモ
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Input
              placeholder="新しいメモを入力..."
              value={quickMemo}
              onChange={(e) => setQuickMemo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleQuickMemoSubmit();
                }
              }}
              className="flex-1 h-12 bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button
              onClick={handleQuickMemoSubmit}
              className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!quickMemo.trim()}
            >
              <Plus className="w-5 h-5 mr-2" />
              追加
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* フローティング新規メモボタン */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg z-50"
      >
        <Plus className="w-6 h-6" />
        <span className="sr-only">新規メモ</span>
      </Button>
    </div>
  );
}
