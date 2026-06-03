import type { EditablePrd } from "./prd-serialize";

export type PrdAgentAction = "polish" | "expand" | "simplify" | "custom";

/** 圈选文本后的快捷操作 */
export type PrdSelectionAction =
  | "changeStyle"
  | "expand"
  | "rewrite"
  | "professionalize"
  | "explain";

export const SELECTION_ACTION_LABEL: Record<PrdSelectionAction, string> = {
  changeStyle: "修改风格",
  expand: "扩写",
  rewrite: "改写",
  professionalize: "专业化",
  explain: "解释说明",
};

export interface PrdSelectionResult {
  replacement: string;
  tip: string;
}

export interface PrdAgentResult {
  suggestion: string;
  revisedBody: string;
  appliedTips: string[];
}

/** 预留：真实 LLM PRD 写作 Agent */
export const PRD_AGENT_HOOK = {
  llm: async (prompt: string) => {
    void prompt;
    return "";
  },
};

export function runPrdAgent(
  action: PrdAgentAction,
  chapterTitle: string,
  body: string,
  productName: string,
  customInstruction?: string,
): PrdAgentResult {
  const tips: string[] = [];
  let revised = body;

  if (action === "polish") {
    tips.push("统一术语与编号格式", "补充可验收表述");
    revised = body
      .replace(/\n{3,}/g, "\n\n")
      .concat("\n\n> [Agent 润色] 已优化段落结构与专业表述，请核对业务事实。");
  } else if (action === "expand") {
    tips.push("补充边界条件", "增加异常流程说明");
    revised =
      body +
      `\n\n### Agent 补充建议\n- 本章节「${chapterTitle}」建议补充：成功指标、依赖系统、负责人角色。\n- 与「${productName}」相关的合规与审计要求需在评审会上确认。`;
  } else if (action === "simplify") {
    tips.push("删减重复描述", "保留 P0 要点");
    const lines = body.split("\n").filter((l) => l.trim());
    revised = lines.slice(0, Math.max(8, Math.ceil(lines.length * 0.65))).join("\n");
    revised += "\n\n> [Agent 精简] 已压缩为评审摘要版，完整细节请从指南页对照 Demo。";
  } else if (action === "custom" && customInstruction) {
    tips.push(`按指令处理：${customInstruction.slice(0, 40)}…`);
    revised =
      body +
      `\n\n### 按指令调整（${customInstruction.slice(0, 24)}…）\n- Agent 建议：在「${chapterTitle}」中显式写出输入/输出字段与人工确认节点。\n- 若涉及对外动作，请增加审批流与回滚说明。`;
  }

  const suggestion =
    action === "custom"
      ? `已根据「${customInstruction ?? ""}」生成修改建议，可应用至正文或继续手动编辑。`
      : `已完成「${chapterTitle}」的${action === "polish" ? "润色" : action === "expand" ? "扩写" : "精简"}，请确认后保存或导出 Word。`;

  return { suggestion, revisedBody: revised, appliedTips: tips };
}

export function runPrdSelectionAgent(
  action: PrdSelectionAction,
  selectedText: string,
  productName: string,
  chapterTitle: string,
): PrdSelectionResult {
  const t = selectedText.trim();
  if (!t) {
    return { replacement: selectedText, tip: "选区为空" };
  }

  switch (action) {
    case "changeStyle":
      return {
        replacement: t
          .replace(/你/g, "用户")
          .replace(/我们/g, "本产品")
          .replace(/。/g, "；")
          .concat("。"),
        tip: "已改为更正式、中性的 PRD 书面风格",
      };
    case "expand":
      return {
        replacement: `${t}\n\n（补充）在「${chapterTitle}」中落地「${productName}」时，需明确：① 责任角色与审批节点；② 可量化验收指标；③ 与现有系统/流程的依赖与例外处理。`,
        tip: "已在选区后扩写落地要素",
      };
    case "rewrite":
      return {
        replacement: t
          .split(/(?<=[。；;])\s*|\n+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .map((line) => `- ${line.replace(/^[-\d.]+\s*/, "")}`)
          .join("\n"),
        tip: "已改写为要点列表表述",
      };
    case "professionalize":
      return {
        replacement: `${t.replace(/很|非常|比较/g, "").trim()}。该描述应符合企业 PRD 规范：可测试、可追溯，并避免口语化歧义。`,
        tip: "已专业化润色（可测试、可追溯）",
      };
    case "explain":
      return {
        replacement: `${t}\n\n> **解释说明**：本段面向产品/研发/业务评审。建议读者关注——**背景**：为何需要该能力；**约束**：权限、合规与数据边界；**验收**：怎样判定完成。若用于「${productName}」，请对照 Demo 中对应模块与 Mock 接口。`,
        tip: "已在选区后插入解释说明",
      };
  }
}

export function replaceSelectionInBody(
  body: string,
  start: number,
  end: number,
  replacement: string,
): string {
  return body.slice(0, start) + replacement + body.slice(end);
}

export function generateFullPrdMarkdown(prd: EditablePrd): string {
  const parts = [`# ${prd.productName} · PRD\n`];
  for (const ch of prd.chapters) {
    parts.push(`\n## ${ch.title}\n\n${ch.body}\n`);
  }
  return parts.join("\n");
}
