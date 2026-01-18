"use server";

const API_BASE = process.env.API_BASE_URL;

export type SignupResult = {
  success: boolean;
  error?: string;
};

export async function signup(formData: FormData): Promise<SignupResult> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!API_BASE) {
    return { success: false, error: "サーバー設定エラーが発生しました" };
  }

  // バリデーション
  if (!name || !email || !password || !confirmPassword) {
    return { success: false, error: "すべての項目を入力してください" };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "パスワードが一致しません" };
  }

  if (password.length < 8) {
    return { success: false, error: "パスワードは8文字以上で入力してください" };
  }

  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        error: data.message || "登録に失敗しました",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "サーバーに接続できませんでした" };
  }
}
