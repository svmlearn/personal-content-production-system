"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderGit2,
  Library,
  LogOut,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/consultation", label: "团队选题", icon: MessageSquare },
  { href: "/dashboard/today", label: "今日内容", icon: Sparkles },
  { href: "/dashboard/content", label: "社媒爆款内容库", icon: Library },
  { href: "/dashboard/history", label: "我的内容", icon: FolderGit2 },
  { href: "/dashboard/team", label: "团队成员", icon: Users },
  { href: "/dashboard/settings", label: "用户信息", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f8f5f1] text-[#1f2328]">
      <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
        <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-[#eadfd7] bg-[#fffaf6] lg:flex">
          <div className="flex h-16 items-center gap-4 border-b border-[#eadfd7] px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2556b]">
              <span className="text-xs font-bold tracking-tight text-white">AI</span>
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-[#1f2328] [font-family:var(--font-cormorant)]">
                内容日历工作台
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#9b8d84]">
                User Workspace
              </p>
            </div>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => {
              const active =
                pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors",
                    active
                      ? "bg-[#fff0ef] text-[#1f2328]"
                      : "text-[#6f625d] hover:bg-white hover:text-[#1f2328]",
                  )}
                >
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors",
                      active ? "bg-[#f2556b]" : "bg-transparent group-hover:bg-[#22b8a7]/35",
                    )}
                  />
                  <item.icon className="h-4 w-4 text-[#9b8d84]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-[#eadfd7] p-4">
            <div className="grid gap-2">
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 rounded-lg border border-[#eadfd7] bg-white px-4 py-3 text-sm text-[#6f625d] transition-colors hover:bg-[#fff5f1] hover:text-[#1f2328]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff0ef] text-xs text-[#f2556b]">
                  我
                </div>
                <div>
                  <p className="text-sm text-[#1f2328]">用户账号</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#9b8d84]">Owner</p>
                </div>
              </Link>
              <form action="/logout" method="post" className="flex">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs text-[#9b8d84] transition-colors hover:bg-white hover:text-[#6f625d]"
                >
                  <LogOut className="size-3.5" aria-hidden="true" />
                  退出登录
                </button>
              </form>
            </div>
          </div>
        </aside>
        <header className="border-b border-[#eadfd7] bg-[#fffaf6] px-4 py-4 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <p className="text-lg font-semibold tracking-tight text-[#1f2328] [font-family:var(--font-cormorant)]">
              内容日历工作台
            </p>
            <form action="/logout" method="post">
              <button
                type="submit"
                className="flex size-8 items-center justify-center rounded-full border border-[#eadfd7] bg-white text-[#9b8d84]"
                aria-label="退出登录"
              >
                <LogOut className="size-4" aria-hidden="true" />
              </button>
            </form>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-2 text-xs",
                    active
                      ? "border-[#f2556b]/35 bg-[#fff0ef] text-[#f2556b]"
                      : "border-[#eadfd7] bg-white text-[#6f625d]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="min-w-0 flex-1 p-4 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden xl:p-6 2xl:p-10">
          <div className="relative flex min-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-lg border border-[#eadfd7] bg-white lg:min-h-0 lg:flex-1 lg:shadow-[0_24px_90px_rgba(77,53,43,0.08)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
