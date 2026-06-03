import type { Customer, FAQItem } from "./types";

export const MOCK_CUSTOMER: Customer = {
  id: "cust-1",
  name: "陈经理",
  company: "华东智造科技有限公司",
  tier: "企业版",
  contact: "138****6620",
  email: "chen@eastsmart.example",
};

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-order-1",
    intent: "order",
    question: "订单发货时间",
    keywords: ["发货", "订单", "物流", "什么时候", "配送"],
    answer:
      "标准品订单在付款后 1-2 个工作日发货；定制方案需 5-7 个工作日。您可在「订单中心」查看物流单号。",
    policy: "《订单与物流政策 v2.1》第 3.2 条",
  },
  {
    id: "faq-refund-1",
    intent: "refund",
    question: "退款申请流程",
    keywords: ["退款", "退货", "申请", "售后"],
    answer:
      "未发货订单支持全额退款；已发货需先申请退货，验收通过后 3-5 个工作日原路退回。",
    policy: "《售后服务政策》退款章节",
  },
  {
    id: "faq-tech-1",
    intent: "technical",
    question: "登录故障排查",
    keywords: ["登录", "登不上", "系统", "故障", "无法访问"],
    answer:
      "请先清除浏览器缓存，确认使用 Chrome 90+；检查账号是否被锁定。企业版用户需连接指定 VPN 节点。",
    policy: "《技术支持手册》登录篇",
  },
  {
    id: "faq-presales-1",
    intent: "presales",
    question: "企业版收费",
    keywords: ["企业版", "收费", "价格", "报价", "多少钱"],
    answer:
      "企业版按年订阅，起步 50 席位，含专属客户成功经理与 SLA 99.9%。具体报价需销售顾问根据模块与席位评估。",
    policy: "《产品价目表》（对外简版）",
  },
  {
    id: "faq-account-1",
    intent: "account",
    question: "账号权限",
    keywords: ["账号", "密码", "权限", "重置", "子账号"],
    answer:
      "管理员可在「组织设置」重置成员密码；子账号权限按角色模板分配，变更即时生效。",
    policy: "《账号安全管理规范》",
  },
  {
    id: "faq-complaint-1",
    intent: "complaint",
    question: "投诉处理",
    keywords: ["投诉", "不满", "差评", "态度", "维权"],
    answer:
      "我们重视每一条反馈。请提供订单号与问题描述，客服主管将在 4 小时内回访。",
    policy: "《客户投诉处理办法》",
  },
];
