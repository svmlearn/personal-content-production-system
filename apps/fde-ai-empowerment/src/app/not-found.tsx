import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold">页面不存在</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        该范式尚未注册或链接有误。
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        返回首页
      </Link>
    </div>
  );
}
