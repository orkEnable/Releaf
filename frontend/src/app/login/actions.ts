"use server";

const API_BASE = process.env.API_BASE_URL;

export type LoginResult = {
  success: boolean;
  error?: string;
};

export async function login(formData: FormData): Promise<LoginResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // バリデーション
  if (!email || !password) {
    return { success: false, error: "メールアドレスとパスワードを入力してください" };
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        error: data.message || "メールアドレスまたはパスワードが正しくありません",
      };
    }

    // TODO: JWTトークンをcookieに保存する処理を追加
    // const data = await res.json();
    // cookies().set("token", data.token, { httpOnly: true, secure: true });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "サーバーに接続できませんでした" };
  }
}
