import { AuthBackButton } from "@/components/app/auth-back-button";
import { MerchantLoginForm } from "@/components/app/merchant-login-form";

const errorMessages: Record<string, string> = {
  "invalid-credentials": "邮箱或密码不正确，请重新输入。",
  "no-merchant-profile": "这个账号还没有绑定用户信息，请使用邀请码注册，或联系平台管理员处理。",
  "auth-not-configured": "登录服务暂不可用，请联系平台管理员检查数据库会话配置。",
  unauthenticated: "请先登录账号，再进入工作台。",
};

function getSafeNextParam(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/platform-admin")) {
    return "/dashboard";
  }

  return value;
}

export default async function MerchantLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string; error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = getSafeNextParam(params.next);
  const errorMessage = params.error ? errorMessages[params.error] : undefined;
  const demoMode = params.demo === "1";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfaf7] px-4 py-6 text-[#1f2328] md:px-6">
      <div
        className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_18%_22%,rgba(242,85,107,0.16),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(34,184,167,0.15),transparent_32%)]"
        aria-hidden="true"
      />
      <AuthBackButton />
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-xl items-center justify-center py-10">
        <MerchantLoginForm demoMode={demoMode} initialErrorMessage={errorMessage} nextPath={next} />
      </div>
    </main>
  );
}
