import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const artifactDir = "/Users/wy/Desktop/个人IP/个人网站搭建/docs/progress/artifacts/job-search";
const csvPath = path.join(artifactDir, "boss-ai-product-jobs-20260609.csv");
const xlsxPath = path.join(artifactDir, "boss-ai-product-jobs-20260609.xlsx");

const csvText = (await fs.readFile(csvPath, "utf8")).replace(/^\uFEFF/, "");
const workbook = await Workbook.fromCSV(csvText, { sheetName: "岗位池" });

const preview = await workbook.inspect({
  kind: "table",
  range: "岗位池!A1:Y6",
  include: "values",
  tableMaxRows: 6,
  tableMaxCols: 25,
});

const errorScan = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 50 },
  summary: "formula error scan",
});

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(xlsxPath);

console.log(JSON.stringify({
  xlsxPath,
  preview: preview.ndjson.split("\n").slice(0, 8),
  formulaErrors: errorScan.ndjson.trim() || "none",
}, null, 2));
