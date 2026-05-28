import Link from "next/link";
import { LogIn, Sparkles, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MerchantLoginFormProps = {
  demoMode?: boolean;
  initialErrorMessage?: string;
  nextPath: string;
};

const demoEmail = process.env.NEXT_PUBLIC_DEMO_MERCHANT_EMAIL?.trim() || "demo@jingjing.local";
const demoPassword = process.env.NEXT_PUBLIC_DEMO_MERCHANT_PASSWORD?.trim() || "jingjing-demo";

export function MerchantLoginForm({
  demoMode = false,
  initialErrorMessage,
  nextPath,
}: MerchantLoginFormProps) {
  return (
    <section className="w-full rounded-lg border border-[#eadfd7] bg-white/92 p-5 shadow-[0_28px_90px_rgba(77,53,43,0.12)] backdrop-blur sm:p-7">
      <div className="flex items-start gap-4 border-b border-[#eadfd7] pb-5">
        <div className="flex size-12 items-center justify-center rounded-lg border border-[#f2556b]/20 bg-[#fff0ef] text-[#f2556b] shadow-[0_18px_44px_rgba(242,85,107,0.14)]">
          <UserRound className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f2556b]">
            User Access
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#1f2328] [font-family:var(--font-cormorant)]">
            登录用户工作台
          </h1>
          <p className="mt-1 text-sm leading-6 text-[#756961]">
            使用演示账号进入咨询诊断、图文工作台和视频工作台。
          </p>
        </div>
      </div>

      {initialErrorMessage ? (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {initialErrorMessage}
        </div>
      ) : null}

      {demoMode ? (
        <div className="mt-5 flex items-start gap-3 rounded-lg border border-[#f2556b]/18 bg-[#fff6f4] px-4 py-3 text-sm text-[#756961]">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-[#f2556b]" aria-hidden="true" />
          <p className="m-0 leading-6">
            已为外部展示填充演示账号。点击登录后会继续走原有认证链路。
          </p>
        </div>
      ) : null}

      <form action="/api/auth/merchant-login" method="post" className="mt-6 grid gap-5">
        <input type="hidden" name="next" value={nextPath} />
        <div className="grid gap-2.5">
          <Label htmlFor="email" className="text-[#756961]">
            邮箱
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            className="h-12 rounded-lg border-[#eadfd7] bg-[#fffaf6] px-4 text-[#1f2328] placeholder:text-[#aa9a91] focus-visible:border-[#f2556b]/50 focus-visible:ring-[#f2556b]/20"
            defaultValue={demoMode ? demoEmail : undefined}
            placeholder={demoEmail}
            autoComplete="username"
            required
          />
        </div>
        <div className="grid gap-2.5">
          <Label htmlFor="password" className="text-[#756961]">
            密码
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            className="h-12 rounded-lg border-[#eadfd7] bg-[#fffaf6] px-4 text-[#1f2328] placeholder:text-[#aa9a91] focus-visible:border-[#f2556b]/50 focus-visible:ring-[#f2556b]/20"
            defaultValue={demoMode ? demoPassword : undefined}
            autoComplete="current-password"
            required
          />
        </div>

        <Button
          type="submit"
          className="mt-1 h-12 rounded-lg border border-[#f2556b]/20 bg-[#f2556b] text-base font-semibold text-white shadow-[0_14px_34px_rgba(242,85,107,0.22)] hover:bg-[#e94b73]"
        >
          <LogIn className="size-4" aria-hidden="true" />
          登录
        </Button>
      </form>

      <div className="mt-5 flex flex-col gap-3 border-t border-[#eadfd7] pt-5 text-sm text-[#756961] sm:flex-row sm:items-center sm:justify-between">
        <span>还没有账号？</span>
        <Link className="font-medium text-[#f2556b] hover:text-[#e94b73]" href="/register">
          使用邀请码注册
        </Link>
      </div>
    </section>
  );
}
