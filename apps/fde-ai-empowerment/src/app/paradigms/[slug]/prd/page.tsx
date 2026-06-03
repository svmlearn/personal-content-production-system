import { notFound } from "next/navigation";
import { ParadigmPrdEditor } from "@/components/paradigm/paradigm-prd-editor";
import { getParadigmBySlug, getParadigmPrd, paradigms } from "@/lib/paradigms";
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
    title: `${paradigm.title} PRD · toB 大模型转型范式`,
    description: `可编辑的 AI Agent 产品 PRD：${paradigm.title}`,
  };
}

export default async function ParadigmPrdPage({ params }: PageProps) {
  const { slug } = await params;
  const paradigm = getParadigmBySlug(slug);
  const prd = getParadigmPrd(slug);
  if (!paradigm || !prd) notFound();

  return <ParadigmPrdEditor paradigm={paradigm} />;
}
