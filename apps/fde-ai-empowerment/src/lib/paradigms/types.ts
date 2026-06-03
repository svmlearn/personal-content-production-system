export type ParadigmStatus = "pending" | "live";

export type ParadigmCategory =
  | "strategy"
  | "product"
  | "operations"
  | "sales"
  | "engineering"
  | "organization";

export type ParadigmDemoLayout = "default" | "immersive";

export interface Paradigm {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: ParadigmCategory;
  status: ParadigmStatus;
  /** 对应 Cursor / Agent 提示词，接入 demo 后展示 */
  prompt?: string;
  tags?: string[];
  order: number;
  /** immersive：全宽 Demo，隐藏范式详情大标题 */
  demoLayout?: ParadigmDemoLayout;
}
