// src/app/page.tsx
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getHealth() {
  const res = await fetch(`${API_BASE}/health`, {
    // Next.js のサーバーコンポーネントで外部APIを叩く時のキャッシュ設定
    cache: 'no-store',
  });
  if (!res.ok) {
    return { status: 'error', service: 'releaf-api' };
  }
  return res.json();
}

export default async function Home() {
  const health = await getHealth();

  return (
    <main style={{ padding: 24 }}>
      <h1>Releaf 🌿</h1>
      <p>バックエンドとの接続テスト：</p>
      <pre>{JSON.stringify(health, null, 2)}</pre>
    </main>
  );
}
