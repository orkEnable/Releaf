import { Suspense } from "react";
import { LoginForm } from "./components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-8 bg-background">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="w-full max-w-md h-96 bg-card rounded-2xl animate-pulse" />}>
          <LoginForm />
        </Suspense>

        {/* フッター */}
        <p className="text-center text-muted-foreground text-sm mt-8">
          ログインすることで、
          <a href="#" className="text-primary hover:underline">
            利用規約
          </a>
          と
          <a href="#" className="text-primary hover:underline">
            プライバシーポリシー
          </a>
          に同意したことになります。
        </p>
      </div>
    </div>
  );
}
