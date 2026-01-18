import { LoginForm } from "./components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-8 bg-background">
      <div className="w-full max-w-md">
        <LoginForm />

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
