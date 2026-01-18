import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Releaf - ログイン",
  description: "Releafメモアプリにログイン",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
