"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { signup } from "../actions";

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const result = await signup(formData);

      if (result.success) {
        router.push("/login?registered=true");
      } else {
        setError(result.error || "登録に失敗しました");
        setIsLoading(false);
      }
    } catch {
      setError("ユーザー登録に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
        {/* ロゴとタイトル */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Releaf</h1>
          <p className="text-muted-foreground mt-2">新規アカウントを作成</p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* 新規登録フォーム */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium">
              お名前
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="山田 太郎"
                className="pl-10 h-12 bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">
              メールアドレス
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                className="pl-10 h-12 bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">
              パスワード
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="8文字以上で入力"
                className="pl-10 pr-10 h-12 bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={
                  showPassword ? "パスワードを隠す" : "パスワードを表示"
                }
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-foreground font-medium"
            >
              パスワード（確認）
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="パスワードを再入力"
                className="pl-10 pr-10 h-12 bg-input border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={
                  showConfirmPassword ? "パスワードを隠す" : "パスワードを表示"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 mt-1 rounded border-border text-primary focus:ring-primary/20 accent-primary"
              required
            />
            <label
              htmlFor="terms"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              <a href="#" className="text-primary hover:underline">
                利用規約
              </a>
              と
              <a href="#" className="text-primary hover:underline">
                プライバシーポリシー
              </a>
              に同意します
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>登録中...</span>
              </div>
            ) : (
              "アカウントを作成"
            )}
          </Button>
        </form>

        {/* ログインリンク */}
        <p className="text-center text-muted-foreground mt-6">
          すでにアカウントをお持ちの方{" "}
          <a
            href="/login"
            className="text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            ログイン
          </a>
        </p>
      </div>
    </div>
  );
}
