export type PrdBlock =
  | { type: "h3"; text: string }
  | { type: "h4"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "code"; text: string };

export interface PrdChapter {
  title: string;
  blocks: PrdBlock[];
}

export interface ParadigmPrdDocument {
  slug: string;
  productName: string;
  chapters: PrdChapter[];
}
