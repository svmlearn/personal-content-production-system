import type { ParadigmPrdConfig } from "./configs/types";
import type { ParadigmPrdDocument, PrdBlock, PrdChapter } from "./prd-types";

function ch(title: string, blocks: PrdBlock[]): PrdChapter {
  return { title, blocks };
}

export function buildParadigmPrd(config: ParadigmPrdConfig): ParadigmPrdDocument {
  const c = config;
  return {
    slug: c.slug,
    productName: c.productName,
    chapters: [
      ch("一、产品背景", [
        { type: "h3", text: "1. 业务背景" },
        { type: "p", text: c.businessBackground },
        { type: "h3", text: "2. 当前用户/业务流程中的痛点" },
        { type: "ul", items: c.painPoints },
        { type: "h3", text: "3. 为什么适合用 AI Agent 解决" },
        { type: "ul", items: c.whyAgent },
        { type: "h3", text: "4. 传统系统/工作流/人工处理方式的不足" },
        { type: "ul", items: c.traditionalLimits },
        { type: "h3", text: "5. AI Agent 介入后的核心价值" },
        { type: "ul", items: c.agentValue },
      ]),
      ch("二、产品定位", [
        { type: "h3", text: "1. 产品名称" },
        { type: "p", text: c.productName },
        { type: "h3", text: "2. 一句话定位" },
        { type: "p", text: c.oneLiner },
        { type: "h3", text: "3. 目标用户" },
        { type: "ul", items: c.targetUsers },
        { type: "h3", text: "4. 使用场景" },
        { type: "ul", items: c.scenarios },
        { type: "h3", text: "5. 产品边界" },
        { type: "ul", items: c.boundaries },
        { type: "h3", text: "6. 不解决什么问题" },
        { type: "ul", items: c.notSolving },
      ]),
      ch("三、用户需求分析", [
        {
          type: "table",
          headers: ["维度", "说明"],
          rows: c.userNeedsTable,
        },
      ]),
      ch("四、AI Agent 能力设计", [
        { type: "p", text: "本产品 Agent 不是普通 Chatbot，而是具备检索、推理、引用与（可选）工具调用能力的任务型智能体。" },
        { type: "h3", text: "1. Agent 的核心目标" },
        { type: "p", text: c.agentGoal },
        { type: "h3", text: "2. Agent 的输入信息" },
        { type: "ul", items: c.agentInputs },
        { type: "h3", text: "3. Agent 的输出结果" },
        { type: "ul", items: c.agentOutputs },
        { type: "h3", text: "4. Agent 需要理解的上下文" },
        { type: "ul", items: c.agentContext },
        { type: "h3", text: "5. Agent 需要调用的工具" },
        { type: "ul", items: c.agentTools },
        { type: "h3", text: "6. Agent 需要访问的数据" },
        { type: "ul", items: c.agentData },
        { type: "h3", text: "7. Agent 的推理/决策逻辑" },
        { type: "ul", items: c.agentReasoning },
        { type: "h3", text: "8. Agent 的任务执行流程" },
        { type: "ol", items: c.agentWorkflow },
        { type: "h3", text: "9. Agent 的异常处理方式" },
        { type: "ul", items: c.agentExceptions },
        { type: "h3", text: "10. Agent 的人类确认节点" },
        { type: "ul", items: c.humanConfirmNodes },
      ]),
      ch("五、核心功能模块", [
        {
          type: "table",
          headers: [
            "模块",
            "功能说明",
            "用户操作",
            "Agent 动作",
            "数据字段",
            "工具/API",
            "前置条件",
            "输出",
            "异常",
            "优先级",
          ],
          rows: c.featureModules,
        },
      ]),
      ch("六、Agent 工作流设计", [
        { type: "h3", text: "标准十步链路" },
        { type: "ol", items: c.tenStepFlow },
        { type: "h3", text: "主流程" },
        { type: "ol", items: c.mainFlow },
        { type: "h3", text: "分支流程" },
        { type: "ul", items: c.branchFlows },
        { type: "h3", text: "异常流程" },
        { type: "ul", items: c.exceptionFlows },
        { type: "h3", text: "人工介入流程" },
        { type: "ul", items: c.humanFlows },
      ]),
      ch("七、页面与交互设计", [
        {
          type: "table",
          headers: ["页面", "页面目标", "核心组件", "用户操作", "Agent 状态", "关键交互"],
          rows: c.pages,
        },
      ]),
      ch("八、数据结构设计", [
        {
          type: "table",
          headers: ["表/对象", "字段名", "类型", "说明", "必填", "示例"],
          rows: c.dataSchema,
        },
      ]),
      ch("九、Prompt 与模型调用设计", [
        { type: "h4", text: "1. System Prompt" },
        { type: "code", text: c.prompts.system },
        { type: "h4", text: "2. Intent Recognition Prompt" },
        { type: "code", text: c.prompts.intent },
        { type: "h4", text: "3. Task Planning Prompt" },
        { type: "code", text: c.prompts.planning },
        { type: "h4", text: "4. Tool Calling Prompt" },
        { type: "code", text: c.prompts.tool },
        { type: "h4", text: "5. Result Generation Prompt" },
        { type: "code", text: c.prompts.result },
        { type: "h4", text: "6. Error Handling Prompt" },
        { type: "code", text: c.prompts.error },
        { type: "h4", text: "7. Human Confirmation Prompt" },
        { type: "code", text: c.prompts.confirm },
      ]),
      ch("十、权限、风控与安全机制", [
        { type: "ul", items: c.security },
      ]),
      ch("十一、MVP 版本规划", [
        {
          type: "table",
          headers: ["类别", "内容"],
          rows: c.mvpTable,
        },
      ]),
      ch("十二、验收标准", [
        {
          type: "table",
          headers: ["类别", "标准"],
          rows: c.acceptance,
        },
      ]),
      ch("十三、技术实现建议", [
        {
          type: "table",
          headers: ["层级", "建议"],
          rows: c.techStack,
        },
      ]),
      ch("十四、最终输出说明", [
        { type: "p", text: c.finalNote },
        { type: "ul", items: [
          "结构覆盖产品、设计、研发、算法协作所需信息",
          "每个功能模块可映射到 Demo 页面与 Mock 函数",
          "Agent 输入、处理、输出链路清晰",
          "人工确认与 MVP 边界已标注",
          "可直接作为立项评审与迭代 backlog 输入",
        ]},
      ]),
    ],
  };
}
