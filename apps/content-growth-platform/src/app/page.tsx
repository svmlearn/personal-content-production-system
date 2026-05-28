import Link from "next/link";
import { ArrowRight, KeyRound, ShieldCheck, UserPlus, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";

const entryCards = [
  {
    title: "用户登录",
    description: "使用演示账号进入咨询诊断和内容工作台，适合外部访客快速查看。",
    href: "/login?demo=1&next=%2Fdashboard",
    icon: KeyRound,
    primary: true,
  },
  {
    title: "成员端",
    description: "成员用自己的用户名和密码登录，或通过邀请码注册加入团队。",
    href: "/member/login",
    icon: UserPlus,
    primary: false,
  },
  {
    title: "平台管理",
    description: "平台管理员进入邀请码、用户治理、Agent 和知识库配置。",
    href: "/platform-admin-login",
    icon: ShieldCheck,
    primary: false,
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfaf7] px-4 py-6 text-[#1f2328] md:px-6">
      <div
        className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_18%_30%,rgba(242,85,107,0.18),transparent_34%),radial-gradient(circle_at_76%_20%,rgba(34,184,167,0.16),transparent_32%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-center gap-8 py-8">
        <section className="max-w-3xl">
          <div className="mb-5 flex size-12 items-center justify-center rounded-lg border border-[#f2556b]/20 bg-white text-[#f2556b] shadow-[0_18px_50px_rgba(242,85,107,0.14)]">
            <UserRound className="size-5" aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f2556b]">
            Jingjing Content Platform
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-[#1f2328] [font-family:var(--font-cormorant)] md:text-6xl">
            内容获客平台
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#6f625d]">
            请选择要进入的身份入口。外部展示优先使用演示账号进入用户工作台。
          </p>
        </section>

        <section className="grid max-w-5xl gap-4 md:grid-cols-3">
          {entryCards.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-56 flex-col justify-between rounded-lg border border-[#eadfd7] bg-white/88 p-5 shadow-[0_18px_60px_rgba(77,53,43,0.08)] transition hover:-translate-y-0.5 hover:border-[#f2556b]/35 hover:bg-white"
            >
              <div>
                <div
                  className={
                    item.primary
                      ? "flex size-11 items-center justify-center rounded-lg bg-[#f2556b] text-white"
                      : "flex size-11 items-center justify-center rounded-lg bg-[#f6f0ea] text-[#6f625d]"
                  }
                >
                  <item.icon className="size-5" aria-hidden="true" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-[#1f2328]">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[#756961]">{item.description}</p>
              </div>
              <div className="mt-6 flex items-center text-sm font-semibold text-[#f2556b]">
                进入
                <ArrowRight className="ml-2 size-4 transition group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="h-11 rounded-lg border border-[#f2556b]/20 bg-[#f2556b] px-5 text-white shadow-[0_14px_34px_rgba(242,85,107,0.22)] hover:bg-[#e94b73]"
            asChild
          >
            <Link href="/login?demo=1&next=%2Fdashboard">用户登录</Link>
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-lg border-[#eadfd7] bg-white px-5 text-[#6f625d] hover:bg-[#fff5f1] hover:text-[#1f2328]"
            asChild
          >
            <Link href="/member/login">成员端</Link>
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-lg border-[#eadfd7] bg-white px-5 text-[#6f625d] hover:bg-[#fff5f1] hover:text-[#1f2328]"
            asChild
          >
            <Link href="/platform-admin-login">平台管理</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
