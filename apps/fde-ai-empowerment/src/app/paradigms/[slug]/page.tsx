import { notFound } from "next/navigation";
import { ParadigmShell } from "@/components/paradigm/paradigm-shell";
import { getParadigmBySlug, paradigms } from "@/lib/paradigms";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return paradigms.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const paradigm = getParadigmBySlug(slug);
  if (!paradigm) return { title: "未找到" };
  return {
    title: `${paradigm.title} · toB 大模型转型范式`,
    description: paradigm.description,
  };
}

export default async function ParadigmPage({ params }: PageProps) {
  const { slug } = await params;
  const paradigm = getParadigmBySlug(slug);
  if (!paradigm) notFound();

  return <ParadigmShell paradigm={paradigm} />;
}
