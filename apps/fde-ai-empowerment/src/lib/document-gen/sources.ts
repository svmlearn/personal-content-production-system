import type { SourceMaterial } from "./types";

export const SOURCE_LIBRARY: SourceMaterial[] = [
  {
    id: "src-prod-1",
    title: "智能审批产品白皮书 v3.2",
    category: "product",
    excerpt:
      "支持可视化流程编排、移动端审批、SLA 预警；与主流 ERP/OA 预置连接器 40+。",
    updatedAt: "2025-03-15",
  },
  {
    id: "src-case-1",
    title: "制造业龙头 A 公司数字化案例",
    category: "case",
    excerpt:
      "审批周期缩短 62%，年节省人力成本约 280 万；三期建设覆盖采购、费用、合同。",
    updatedAt: "2025-02-20",
  },
  {
    id: "src-ind-1",
    title: "2025 制造业数字化趋势简报",
    category: "industry",
    excerpt:
      "平台化、低代码与 AI 辅助决策成为主旋律；合规与数据安全投入占比上升。",
    updatedAt: "2025-04-01",
  },
  {
    id: "src-tpl-1",
    title: "企业售前方案标准模板",
    category: "template",
    excerpt: "推荐结构：背景-痛点-方案-价值-案例-实施-商务-附录。",
    updatedAt: "2025-01-10",
  },
  {
    id: "src-prod-2",
    title: "知识库与 AI 问答模块说明",
    category: "product",
    excerpt: "可溯源问答、三级权限、每日增量索引；适配制度/SOP/FAQ 场景。",
    updatedAt: "2025-03-28",
  },
  {
    id: "src-case-2",
    title: "金融集团知识库项目案例",
    category: "case",
    excerpt: "一线查询效率提升 3 倍；合规问询全链路审计保留 180 天。",
    updatedAt: "2025-01-25",
  },
];

export function getSourceById(id: string): SourceMaterial | undefined {
  return SOURCE_LIBRARY.find((s) => s.id === id);
}
