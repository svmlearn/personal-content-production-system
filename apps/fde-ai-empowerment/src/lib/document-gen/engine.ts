import { SOURCE_LIBRARY, getSourceById } from "./sources";
import { DOCUMENT_TEMPLATES } from "./templates";
import type {
  ApprovalRecord,
  ApprovalStatus,
  DocumentForm,
  DocumentOutline,
  DocumentSection,
  DocumentType,
  ExportPreview,
  GeneratedDocument,
  OutlineSection,
  OutputStyle,
  SectionCitation,
  SourceMaterial,
} from "./types";

/** 预留：LLM / 知识库 / 导出服务 */
export const DOC_HOOK = {
  llmComplete: async (prompt: string) => {
    void prompt;
    return "";
  },
  exportFile: async (format: string, doc: GeneratedDocument) => {
    void format;
    void doc;
    return { url: "" };
  },
};

const OUTLINE_TEMPLATES: Record<DocumentType, OutlineSection[]> = {
  presales_proposal: [
    {
      id: "o1",
      level: 1,
      title: "项目背景与目标",
      goal: "阐明客户现状与建设目标",
      suggestedSources: ["src-tpl-1", "src-ind-1"],
    },
    {
      id: "o2",
      level: 1,
      title: "客户痛点分析",
      goal: "结构化描述业务痛点与影响",
      suggestedSources: ["src-ind-1"],
    },
    {
      id: "o2-1",
      level: 2,
      title: "流程与系统现状",
      goal: "描述审批与数据孤岛问题",
      suggestedSources: [],
    },
    {
      id: "o3",
      level: 1,
      title: "解决方案架构",
      goal: "呈现产品模块与集成方式",
      suggestedSources: ["src-prod-1", "src-prod-2"],
    },
    {
      id: "o4",
      level: 1,
      title: "产品能力与价值",
      goal: "匹配模块与客户收益",
      suggestedSources: ["src-prod-1"],
    },
    {
      id: "o5",
      level: 1,
      title: "成功案例",
      goal: "引用同行业案例增强信任",
      suggestedSources: ["src-case-1", "src-case-2"],
    },
    {
      id: "o6",
      level: 1,
      title: "实施路径与计划",
      goal: "分阶段交付与里程碑",
      suggestedSources: ["src-tpl-1"],
    },
  ],
  bid_response: [
    { id: "b1", level: 1, title: "项目理解与响应", goal: "逐条响应招标需求", suggestedSources: ["src-tpl-1"] },
    { id: "b2", level: 1, title: "技术方案", goal: "架构与功能响应", suggestedSources: ["src-prod-1"] },
    { id: "b3", level: 1, title: "实施与交付", goal: "计划、团队与质量", suggestedSources: ["src-case-1"] },
    { id: "b4", level: 1, title: "商务与资质", goal: "报价说明与资质清单", suggestedSources: ["src-tpl-1"] },
  ],
  industry_report: [
    { id: "i1", level: 1, title: "行业概览", goal: "市场规模与驱动因素", suggestedSources: ["src-ind-1"] },
    { id: "i2", level: 1, title: "竞争格局", goal: "主要玩家与差异化", suggestedSources: ["src-ind-1"] },
    { id: "i3", level: 1, title: "机会与建议", goal: "切入策略", suggestedSources: ["src-case-1"] },
  ],
  contract_summary: [
    { id: "c1", level: 1, title: "合同概要", goal: "主体、标的与期限", suggestedSources: ["src-tpl-1"] },
    { id: "c2", level: 1, title: "风险条款摘要", goal: "列出高风险项", suggestedSources: [] },
    { id: "c3", level: 1, title: "修改建议", goal: "给出谈判要点", suggestedSources: [] },
  ],
  meeting_minutes: [
    { id: "m1", level: 1, title: "会议信息", goal: "时间、参会人", suggestedSources: [] },
    { id: "m2", level: 1, title: "讨论要点", goal: "归纳讨论内容", suggestedSources: [] },
    { id: "m3", level: 1, title: "结论与待办", goal: "明确责任人与时间", suggestedSources: [] },
  ],
  weekly_report: [
    { id: "w1", level: 1, title: "本周进展", goal: "完成项与数据", suggestedSources: [] },
    { id: "w2", level: 1, title: "风险与问题", goal: "阻塞项", suggestedSources: [] },
    { id: "w3", level: 1, title: "下周计划", goal: "优先级任务", suggestedSources: [] },
  ],
  activity_review: [
    { id: "a1", level: 1, title: "活动回顾", goal: "背景与目标", suggestedSources: [] },
    { id: "a2", level: 1, title: "数据表现", goal: "核心指标对比", suggestedSources: [] },
    { id: "a3", level: 1, title: "优化建议", goal: "下次改进点", suggestedSources: ["src-case-2"] },
  ],
};

export function findRelevantSources(section: OutlineSection): SourceMaterial[] {
  const ids =
    section.suggestedSources.length > 0
      ? section.suggestedSources
      : SOURCE_LIBRARY.slice(0, 2).map((s) => s.id);
  return ids
    .map((id) => getSourceById(id))
    .filter((s): s is SourceMaterial => Boolean(s));
}

export function generateDocumentOutline(
  docType: DocumentType,
  formData: DocumentForm,
): DocumentOutline {
  const base = OUTLINE_TEMPLATES[docType] ?? OUTLINE_TEMPLATES.presales_proposal;
  const sections = base.map((s) => {
    const title =
      s.id === "o1" && formData.customer
        ? `${formData.customer} — 项目背景与目标`
        : s.title;
    return { ...s, title };
  });
  return { sections };
}

function stylePrefix(style: OutputStyle): string {
  const map: Record<OutputStyle, string> = {
    formal: "综上所述，",
    consulting: "从业务视角分析，",
    sales: "我们将为贵司提供，",
    concise: "",
  };
  return map[style];
}

export function generateSectionContent(
  section: OutlineSection,
  formData: DocumentForm,
  sources: SourceMaterial[],
  style: OutputStyle = "consulting",
): { content: string; citations: SectionCitation[] } {
  const customer = formData.customer ?? formData.project ?? "客户";
  const prefix = stylePrefix(style);
  const citations: SectionCitation[] = sources.slice(0, 2).map((s) => ({
    sourceId: s.id,
    label: s.title,
  }));

  const contentMap: Record<string, string> = {
    "项目背景与目标": `${prefix}${customer} 正处于数字化转型关键阶段，所属${formData.industry ?? "行业"}对流程效率与数据贯通提出更高要求。本期建设目标：${formData.goal ?? "提升流程数字化水平"}，实施周期 ${formData.duration ?? "8 周"}。`,
    "客户痛点分析": `${prefix}核心痛点包括：${formData.pains ?? "审批效率低、系统孤岛"}. 这些问题直接影响管理透明度与业务响应速度，需要通过平台化方案系统性解决。`,
    "流程与系统现状": `当前审批链路跨多个系统，数据需人工对账；移动端体验不足导致外勤审批延迟。`,
    "解决方案架构": `${prefix}建议采用「${formData.modules ?? "智能审批、集成平台"}」组合：统一门户 + 流程引擎 + 开放 API，与现有 NC/OA 等系统双向同步。${sources[0] ? `（参考：${sources[0].excerpt.slice(0, 40)}…）` : ""}`,
    "产品能力与价值": `智能审批支持 SLA 预警与移动审批；集成平台提供 40+ 预置连接器。预期审批周期缩短 40%+。`,
    "成功案例": `参考${formData.referenceCase ?? "同行业标杆客户"}：${sources.find((s) => s.category === "case")?.excerpt ?? "实现显著降本增效"}。`,
    "实施路径与计划": `建议分三阶段：调研设计（2周）→ 开发与联调（4周）→ 培训上线（2周）。`,
    "项目理解与响应": `我方完全理解${formData.project ?? "本项目"}需求，将在技术、实施、服务三方面逐条响应。`,
    "会议信息": `会议主题：${formData.meetingTitle ?? "—"}；参会：${formData.attendees ?? "—"}。`,
    "讨论要点": `${formData.rawNotes ?? "详见会议记录"}`,
    "结论与待办": `结论：推进技术评估会；待办：客户提供流程文档（周三前）。`,
    "本周进展": `项目：${formData.project ?? "—"}；${formData.highlights ?? "按计划推进开发与联调"}`,
    "风险与问题": `${formData.risks ?? "暂无重大风险，需关注第三方接口排期"}`,
    "下周计划": `完成 UAT 环境部署；启动用户培训材料编写。`,
  };

  const matched = Object.entries(contentMap).find(([k]) =>
    section.title.includes(k),
  );
  const content =
    matched?.[1] ??
    `${prefix}本节「${section.title}」：${section.goal}。结合${customer}实际情况展开论述。（可点击重新生成或润色）`;

  return { content, citations };
}

export function rewriteContent(
  content: string,
  mode: "expand" | "shorten" | "polish" | OutputStyle,
): string {
  if (mode === "expand")
    return `${content}\n\n补充说明：上述内容可结合客户具体流程进一步细化，包括组织范围、接口清单与验收标准，确保方案可落地、可度量。`;
  if (mode === "shorten") {
    const first = content.split("。")[0];
    return first ? `${first}。` : content.slice(0, 120);
  }
  if (mode === "polish")
    return content.replace(/。/g, "。\n").trim();
  return `${stylePrefix(mode as OutputStyle)}${content}`;
}

export function generateExportPreview(
  document: GeneratedDocument,
  format: "word" | "ppt" | "pdf",
): ExportPreview {
  const ext = { word: "docx", ppt: "pptx", pdf: "pdf" }[format];
  const pages = document.sections.length * 2 + 2;
  return {
    format,
    filename: `${document.title}.${ext}`,
    pageCount: format === "ppt" ? Math.ceil(document.sections.length / 2) : pages,
    message: `已模拟生成 ${ext.toUpperCase()} 文件（Demo 无真实下载，生产环境对接 DOC_HOOK.exportFile）`,
  };
}

export function submitForApproval(
  doc: GeneratedDocument,
): { status: ApprovalStatus; record: ApprovalRecord } {
  const record: ApprovalRecord = {
    id: `apr-${Date.now()}`,
    actor: "当前用户",
    action: "提交审核",
    comment: `请审核《${doc.title}》`,
    timestamp: new Date().toISOString(),
    status: "pending_review",
  };
  return { status: "pending_review", record };
}

export function simulateApprovalStep(
  doc: GeneratedDocument,
  approve: boolean,
): ApprovalRecord {
  const status: ApprovalStatus = approve ? "approved" : "needs_revision";
  return {
    id: `apr-${Date.now()}`,
    actor: approve ? "法务-张律师" : "售前主管-李总",
    action: approve ? "审核通过" : "退回修改",
    comment: approve ? "条款与方案描述符合规范" : "请补充资质文件章节",
    timestamp: new Date().toISOString(),
    status,
  };
}

export function createDocument(
  type: DocumentType,
  form: DocumentForm,
): GeneratedDocument {
  const tpl = DOCUMENT_TEMPLATES.find((t) => t.type === type)!;
  const title =
    type === "presales_proposal"
      ? `${form.customer ?? "客户"}售前方案`
      : type === "meeting_minutes"
        ? form.meetingTitle ?? "会议纪要"
        : tpl.label;

  const styleMap: Record<string, OutputStyle> = {
    正式: "formal",
    咨询风: "consulting",
    销售风: "sales",
    简洁: "concise",
  };

  return {
    id: `doc-${Date.now()}`,
    type,
    title,
    form,
    outline: { sections: [] },
    sections: [],
    style: styleMap[form.style ?? ""] ?? "consulting",
    approvalStatus: "draft",
    approvalHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function buildSectionsFromOutline(
  outline: DocumentOutline,
  form: DocumentForm,
  style: OutputStyle,
): DocumentSection[] {
  return outline.sections.map((os) => {
    const sources = findRelevantSources(os);
    const { content, citations } = generateSectionContent(
      os,
      form,
      sources,
      style,
    );
    return {
      id: `sec-${os.id}`,
      outlineId: os.id,
      title: os.title,
      content,
      citations,
      status: "generated",
    };
  });
}

export function assembleFullText(doc: GeneratedDocument): string {
  return doc.sections
    .map((s) => `## ${s.title}\n\n${s.content}`)
    .join("\n\n");
}
