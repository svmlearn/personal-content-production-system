import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import type { EditablePrd } from "./prd-serialize";

function parseLine(line: string): Paragraph {
  const trimmed = line.trim();
  if (trimmed.startsWith("### "))
    return new Paragraph({
      text: trimmed.slice(4),
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
    });
  if (trimmed.startsWith("#### "))
    return new Paragraph({
      text: trimmed.slice(5),
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 180, after: 80 },
    });
  if (trimmed.startsWith("- "))
    return new Paragraph({
      text: trimmed.slice(2),
      bullet: { level: 0 },
    });
  if (/^\d+\.\s/.test(trimmed))
    return new Paragraph({
      text: trimmed,
      spacing: { after: 80 },
    });
  if (trimmed.startsWith("|") && trimmed.includes("|")) {
    return new Paragraph({ text: trimmed, spacing: { after: 60 } });
  }
  if (trimmed.startsWith("> "))
    return new Paragraph({
      children: [new TextRun({ text: trimmed.slice(2), italics: true, color: "666666" })],
    });
  if (trimmed === "```")
    return new Paragraph({ text: "" });
  return new Paragraph({
    text: trimmed,
    spacing: { after: 120 },
  });
}

function bodyToParagraphs(body: string): Paragraph[] {
  return body.split("\n").map(parseLine).filter((p) => p);
}

export async function exportPrdToDocx(prd: EditablePrd): Promise<Blob> {
  const children: Paragraph[] = [
    new Paragraph({
      text: prd.productName,
      heading: HeadingLevel.TITLE,
      spacing: { after: 300 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "AI Agent 产品需求文档（PRD）",
          size: 22,
          color: "666666",
        }),
      ],
      spacing: { after: 400 },
    }),
  ];

  for (const ch of prd.chapters) {
    children.push(
      new Paragraph({
        text: ch.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 200 },
        pageBreakBefore: children.length > 2,
      }),
    );
    children.push(...bodyToParagraphs(ch.body));
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
