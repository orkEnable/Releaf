"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHome } from "./components/dashboard-home";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* モバイルオーバーレイ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* サイドバー */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <AppSidebar />
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* モバイルヘッダー */}
        <header className="lg:hidden flex items-center gap-3 p-4 border-b border-border bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-foreground">ホーム</h1>
        </header>

        <DashboardHome />
      </main>
    </div>
  );
}
