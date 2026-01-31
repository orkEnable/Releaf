"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  BookOpen,
  FolderOpen,
  Settings,
  Leaf,
} from "lucide-react"

const mainNavigation = [
  { name: "ホーム", href: "/dashboard", icon: Home },
  { name: "復習", href: "/dashboard/review", icon: BookOpen },
  { name: "メモ", href: "/dashboard/memos", icon: FolderOpen },
]

const bottomNavigation = [
  { name: "設定", href: "/dashboard/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  const NavItem = ({ item }: { item: { name: string; href: string; icon: React.ComponentType<{ className?: string }> } }) => {
    const isActive = pathname === item.href
    return (
      <li>
        <Link
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.name}
        </Link>
      </li>
    )
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border">
      {/* ロゴ */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
        <Leaf className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold text-foreground">Releaf</span>
      </div>

      {/* メインナビゲーション */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {mainNavigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </ul>
      </nav>

      {/* 下部ナビゲーション（設定） */}
      <nav className="px-3 py-4 border-t border-border">
        <ul className="space-y-1">
          {bottomNavigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </ul>
      </nav>
    </div>
  )
}
