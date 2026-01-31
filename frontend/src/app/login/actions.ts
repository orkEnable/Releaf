"use server";

import { cookies } from "next/headers";

const API_BASE = process.env.API_BASE_URL;
if (!API_BASE) {
  throw new Error("API_BASE_URL environment variable is not set");
}

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

    const data = await res.json();
    const cookieStore = await cookies();
    cookieStore.set("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1時間（JWTの有効期限と合わせる）
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "サーバーに接続できませんでした" };
  }
}
