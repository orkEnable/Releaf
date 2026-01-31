"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  RotateCcw,
  Check,
  Meh,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// サンプルの復習データ
const reviewMemos = [
  {
    id: 1,
    title: "React 19の新機能",
    content:
      "use()フック、アクションAPI、サーバーコンポーネントの改善点について。Suspenseとの連携が強化され、データフェッチングがよりシンプルに。Server Actionsはフォーム処理を革新的に簡単にする。",
    lastReviewed: "3日前",
    reviewCount: 2,
    difficulty: "medium",
  },
  {
    id: 2,
    title: "DDD Repository設計",
    content:
      "Repositoryはドメインオブジェクトのコレクションのように振る舞う。永続化の詳細を隠蔽し、ドメイン層をインフラから分離する。集約ルートごとに1つのRepositoryを持つのが基本。",
    lastReviewed: "5日前",
    reviewCount: 4,
    difficulty: "hard",
  },
  {
    id: 3,
    title: "CQRSの考え方",
    content:
      "Command Query Responsibility Segregation。読み取りと書き込みを分離することで、それぞれを独立して最適化できる。イベントソーシングと組み合わせることが多い。",
    lastReviewed: "1週間前",
    reviewCount: 1,
    difficulty: "medium",
  },
];

export default function ReviewPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentMemo = reviewMemos[currentIndex];
  const progress = (completedCount / reviewMemos.length) * 100;

  const handleAnswer = (type: "again" | "okay" | "good") => {
    // 回答タイプに応じて次回の復習間隔を調整（実際の実装時）

    setShowAnswer(false);
    setCompletedCount(completedCount + 1);

    if (currentIndex < reviewMemos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "hard":
        return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "簡単";
      case "medium":
        return "普通";
      case "hard":
        return "難しい";
      default:
        return "";
    }
  };

  // 完了画面
  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-border bg-card text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              お疲れさまでした!
            </h1>
            <p className="text-muted-foreground mb-6">
              今日の復習 {reviewMemos.length}件を完了しました
            </p>
            <Link href="/dashboard">
              <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground">
                ホームに戻る
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
              <span className="sr-only">戻る</span>
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground">
                今日の復習
              </span>
              <span className="text-sm text-muted-foreground">
                {completedCount + 1} / {reviewMemos.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Card className="border-border bg-card overflow-hidden">
            {/* カードヘッダー */}
            <div className="bg-primary/5 border-b border-primary/10 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      復習回数: {currentMemo.reviewCount}回
                    </p>
                    <p className="text-xs text-muted-foreground">
                      最終復習: {currentMemo.lastReviewed}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-full border",
                    getDifficultyColor(currentMemo.difficulty)
                  )}
                >
                  {getDifficultyLabel(currentMemo.difficulty)}
                </span>
              </div>
            </div>

            {/* カード本体 */}
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                {currentMemo.title}
              </h2>

              {!showAnswer ? (
                <div className="text-center">
                  <p className="text-muted-foreground mb-8">
                    このメモの内容を思い出せますか?
                  </p>
                  <Button
                    onClick={() => setShowAnswer(true)}
                    className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    答えを見る
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="p-4 rounded-lg bg-muted/50 mb-8">
                    <p className="text-foreground leading-relaxed">
                      {currentMemo.content}
                    </p>
                  </div>

                  <p className="text-sm text-center text-muted-foreground mb-4">
                    どのくらい覚えていましたか?
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleAnswer("again")}
                      className="h-14 flex-col gap-1 border-rose-500/30 hover:bg-rose-500/10 hover:border-rose-500/50 bg-transparent"
                    >
                      <RotateCcw className="w-5 h-5 text-rose-500" />
                      <span className="text-sm">もう一度</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAnswer("okay")}
                      className="h-14 flex-col gap-1 border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500/50 bg-transparent"
                    >
                      <Meh className="w-5 h-5 text-amber-500" />
                      <span className="text-sm">まあまあ</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAnswer("good")}
                      className="h-14 flex-col gap-1 border-primary/30 hover:bg-primary/10 hover:border-primary/50 bg-transparent"
                    >
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-sm">覚えた</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
