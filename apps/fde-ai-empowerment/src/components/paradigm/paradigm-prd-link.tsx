import Link from "next/link";
import { FileText } from "lucide-react";

interface ParadigmPrdLinkProps {
  slug: string;
  className?: string;
}

export function ParadigmPrdLink({ slug, className = "" }: ParadigmPrdLinkProps) {
  return (
    <Link
      href={`/paradigms/${slug}/prd`}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-100 ${className}`}
    >
      <FileText className="h-4 w-4" />
      PRD 文档
    </Link>
  );
}
