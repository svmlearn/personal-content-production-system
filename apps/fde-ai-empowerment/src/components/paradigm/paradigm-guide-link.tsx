import Link from "next/link";
import { BookOpen } from "lucide-react";

interface ParadigmGuideLinkProps {
  slug: string;
  variant?: "button" | "text";
  className?: string;
}

export function ParadigmGuideLink({
  slug,
  variant = "button",
  className = "",
}: ParadigmGuideLinkProps) {
  if (variant === "text") {
    return (
      <Link
        href={`/paradigms/${slug}/guide`}
        className={`inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary ${className}`}
      >
        <BookOpen className="h-4 w-4" />
        项目指南
      </Link>
    );
  }

  return (
    <Link
      href={`/paradigms/${slug}/guide`}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-primary ${className}`}
    >
      <BookOpen className="h-4 w-4" />
      项目指南
    </Link>
  );
}
