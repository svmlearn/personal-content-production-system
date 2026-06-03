import type { ParadigmPrdDocument, PrdBlock, PrdChapter } from "./prd-types";

export interface EditablePrdChapter {
  id: string;
  title: string;
  body: string;
}

export interface EditablePrd {
  slug: string;
  productName: string;
  chapters: EditablePrdChapter[];
}

function blockToLines(block: PrdBlock): string[] {
  switch (block.type) {
    case "h3":
      return [`\n### ${block.text}`, ""];
    case "h4":
      return [`\n#### ${block.text}`, ""];
    case "p":
      return [block.text, ""];
    case "ul":
      return [...block.items.map((i) => `- ${i}`), ""];
    case "ol":
      return [...block.items.map((i, idx) => `${idx + 1}. ${i}`), ""];
    case "table": {
      const header = `| ${block.headers.join(" | ")} |`;
      const sep = `| ${block.headers.map(() => "---").join(" | ")} |`;
      const rows = block.rows.map((r) => `| ${r.join(" | ")} |`);
      return [header, sep, ...rows, ""];
    }
    case "code":
      return ["```", block.text, "```", ""];
    default:
      return [];
  }
}

export function chapterToBody(chapter: PrdChapter): string {
  return chapter.blocks.flatMap(blockToLines).join("\n").trim();
}

export function documentToEditable(doc: ParadigmPrdDocument): EditablePrd {
  return {
    slug: doc.slug,
    productName: doc.productName,
    chapters: doc.chapters.map((ch, i) => ({
      id: `ch-${i}`,
      title: ch.title,
      body: chapterToBody(ch),
    })),
  };
}

export function getPrdPreview(doc: ParadigmPrdDocument) {
  const editable = documentToEditable(doc);
  const bg = editable.chapters[0]?.body ?? "";
  const pos = editable.chapters[1]?.body ?? "";
  const agent = editable.chapters[3]?.body ?? "";
  const firstPara = (s: string) =>
    s.split("\n").find((l) => l.trim() && !l.startsWith("#") && !l.startsWith("|")) ?? "";

  return {
    productName: doc.productName,
    chapterCount: doc.chapters.length,
    positioning: firstPara(pos).slice(0, 160),
    backgroundSnippet: firstPara(bg).slice(0, 200),
    agentSnippet: firstPara(agent).slice(0, 160),
    toc: doc.chapters.map((c) => c.title),
  };
}

export function storageKey(slug: string) {
  return `tob-prd-edits:${slug}`;
}
