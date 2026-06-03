import { buildParadigmPrd } from "./builder";
import { PRD_CONFIGS } from "./configs/all";
import type { ParadigmPrdDocument } from "./prd-types";

const documents = PRD_CONFIGS.map(buildParadigmPrd);

export function getParadigmPrd(slug: string): ParadigmPrdDocument | undefined {
  return documents.find((d) => d.slug === slug);
}

export function getAllParadigmPrds(): ParadigmPrdDocument[] {
  return documents;
}

export * from "./prd-serialize";
export * from "./prd-agent";
export * from "./export-docx";
