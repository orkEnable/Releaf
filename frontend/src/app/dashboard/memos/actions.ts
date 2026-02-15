"use server";

import { cookies } from "next/headers";

const API_BASE = process.env.API_BASE_URL;
if (!API_BASE) {
  throw new Error("API_BASE_URL environment variable is not set");
}

export type MemoResult = {
  success: boolean;
  memoId?: string;
  error?: string;
};

export type Memo = {
  id: string;
  title: string;
  content: string;
  reviewCount: number;
  lastReviewedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type GetMemosResult = {
  success: boolean;
  memos?: Memo[];
  error?: string;
};

/**
 * メモを新規作成
 */
export async function createMemo(
  title: string,
  content: string
): Promise<MemoResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { success: false, error: "認証が必要です" };
  }

  try {
    const res = await fetch(`${API_BASE}/memos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        error: data.message || "メモの作成に失敗しました",
      };
    }

    // 201 Created - レスポンスからIDを取得
    const data = await res.json();
    return { success: true, memoId: data.id };
  } catch (error) {
    console.error("Create memo error:", error);
    return { success: false, error: "サーバーに接続できませんでした" };
  }
}

/**
 * メモを更新
 */
export async function updateMemo(
  memoId: string,
  title: string,
  content: string
): Promise<MemoResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { success: false, error: "認証が必要です" };
  }

  try {
    const res = await fetch(`${API_BASE}/memos/${memoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        error: data.message || "メモの更新に失敗しました",
      };
    }

    return { success: true, memoId };
  } catch (error) {
    console.error("Update memo error:", error);
    return { success: false, error: "サーバーに接続できませんでした" };
  }
}

/**
 * 下書きメモを保存（新規 or 更新を自動判定）
 * - memoIdが "new_" で始まる場合は新規作成
 * - それ以外は更新
 */
export async function saveMemo(
  memoId: string,
  title: string,
  content: string
): Promise<MemoResult> {
  if (memoId.startsWith("new_")) {
    return createMemo(title, content);
  }
  return updateMemo(memoId, title, content);
}

/**
 * メモ一覧を取得
 */
export async function getMemos(
  limit?: number,
  offset?: number
): Promise<GetMemosResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { success: false, error: "認証が必要です" };
  }

  try {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append("limit", String(limit));
    if (offset !== undefined) params.append("offset", String(offset));

    const url = `${API_BASE}/memos${params.toString() ? `?${params}` : ""}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        error: data.message || "メモの取得に失敗しました",
      };
    }

    const memos = await res.json();
    return { success: true, memos };
  } catch (error) {
    console.error("Get memos error:", error);
    return { success: false, error: "サーバーに接続できませんでした" };
  }
}
