import { notFound } from "next/navigation";
import { ParadigmGuideView } from "@/components/paradigm/paradigm-guide-view";
import { getParadigmBySlug, paradigms } from "@/lib/paradigms";
import { getParadigmGuide } from "@/lib/paradigms/guides";
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
    title: `${paradigm.title} 项目指南 · toB 大模型转型范式`,
    description: `${paradigm.title}的产品要点、PRD、逻辑架构与大模型作用说明`,
  };
}

export default async function ParadigmGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const paradigm = getParadigmBySlug(slug);
  const guide = getParadigmGuide(slug);
  if (!paradigm || !guide) notFound();

  return <ParadigmGuideView paradigm={paradigm} guide={guide} />;
}
