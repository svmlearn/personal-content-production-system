import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "toB 大模型转型范式集合",
  description:
    "面向 toB 企业的大模型转型范式与可体验 Demo 集合，每段提示词对应一个落地范式。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <SiteHeader />
        <main>{children}</main>
        <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
          toB 大模型转型范式集合 · 提示词驱动的可体验 Demo 库
        </footer>
      </body>
    </html>
  );
}
