import { KNOWLEDGE_SNIPPETS } from "./mock-data";
import type {
  Employee,
  LearningPath,
  PathStage,
  Quiz,
  QuizAnswer,
  QuizGradeResult,
  QuizQuestion,
  RoleplayMessage,
  RoleplayRole,
  RoleplayScore,
  ScoreReport,
  TrainingAnswer,
  EmployeeRole,
} from "./types";

/** 预留：课程库 / 企业知识库 / LLM / HR 系统 */
export const TRAINING_HOOK = {
  fetchCourses: async () => null,
  queryKnowledgeBase: async (q: string) => {
    void q;
    return "";
  },
  llm: async (prompt: string) => {
    void prompt;
    return "";
  },
  syncHr: async (report: ScoreReport) => {
    void report;
    return true;
  },
};

function baseStages(role: EmployeeRole): PathStage[] {
  const mk = (
    id: string,
    name: string,
    courses: string[],
    practice: string,
    quiz: string,
    hours: number,
    status: PathStage["status"],
  ): PathStage => ({
    id,
    name,
    courses: courses.map((title, i) => ({
      id: `${id}-c${i}`,
      title,
      durationMin: 30 + i * 15,
      type: i === 0 ? "video" : "doc",
    })),
    practice,
    quiz,
    estimatedHours: hours,
    status,
  });

  const paths: Record<EmployeeRole, PathStage[]> = {
    new_hire: [
      mk("s1", "文化融入", ["企业文化", "信息安全"], "导师见面礼任务", "合规小测", 4, "done"),
      mk("s2", "岗位基础", ["产品 P101", "工具入门"], "Shadow 跟岗", "产品测验", 8, "active"),
      mk("s3", "实战演练", ["业务流程"], "模拟工单", "综合测验", 6, "locked"),
    ],
    sales: [
      mk("s1", "产品精通", ["产品深度", "竞品图谱"], "卖点演练", "产品认证", 6, "done"),
      mk("s2", "销售技巧", ["SPIN 提问", "异议处理"], "异议陪练 x3", "话术测验", 10, "active"),
      mk("s3", "大客户", ["方案销售", "招投标"], "方案路演", "大客户认证", 12, "locked"),
    ],
    support: [
      mk("s1", "服务基础", ["服务礼仪", "工单系统"], "接听模拟", "SOP 测验", 5, "done"),
      mk("s2", "投诉处理", ["情绪安抚", "升级策略"], "投诉陪练", "情景测验", 8, "active"),
      mk("s3", "专家进阶", ["复杂故障", "VIP 服务"], "二线 Shadow", "专家认证", 10, "locked"),
    ],
    manager: [
      mk("s1", "管理基础", ["辅导技巧", "绩效沟通"], "1:1 模拟", "管理测验", 6, "done"),
      mk("s2", "团队赋能", ["复盘方法", "人才盘点"], "团队复盘会", "领导力测验", 8, "active"),
      mk("s3", "战略协同", ["目标拆解", "跨部门协作"], "OKR 工作坊", "总监答辩", 10, "locked"),
    ],
  };
  return paths[role];
}

const PATH_TITLES: Record<EmployeeRole, string> = {
  new_hire: "新员工入职路径",
  sales: "销售能力成长路径",
  support: "客服处理路径",
  manager: "管理者成长路径",
};

export function generateLearningPath(profile: Pick<Employee, "role">): LearningPath {
  const stages = baseStages(profile.role);
  const done = stages.filter((s) => s.status === "done").length;
  const totalHours = stages.reduce((a, s) => a + s.estimatedHours, 0);
  return {
    id: `path-${profile.role}`,
    role: profile.role,
    title: PATH_TITLES[profile.role],
    stages,
    totalHours,
    progressPercent: Math.round((done / stages.length) * 100 + 15),
  };
}

export function answerTrainingQuestion(question: string): TrainingAnswer {
  const q = question.toLowerCase();
  for (const item of KNOWLEDGE_SNIPPETS) {
    if (item.keys.some((k) => q.includes(k.toLowerCase()) || question.includes(k))) {
      return {
        answer: item.answer,
        citations: [item.cite],
        relatedCourses: ["产品话术手册", "销售异议处理", "新员工入职路径"].slice(0, 2),
      };
    }
  }
  return {
    answer:
      "根据培训资料，建议先明确您的岗位场景（销售/客服/管理），我可为您推荐对应课程章节与陪练模块。您也可以尝试问：「产品卖点怎么讲？」或「客户说价格贵怎么办？」",
    citations: ["《企业学习知识库索引》"],
    relatedCourses: ["产品基础 P101"],
  };
}

const ROLEPLAY_OPENERS: Record<RoleplayRole, string> = {
  objection: "我看了你们的方案，功能不错，但价格比竞品贵 20%，我们预算很紧。",
  complaint: "你们系统又宕机了！我们老板非常生气，今天必须给个说法！",
  interview: "请用 2 分钟介绍一下你过去最有成就感的一个项目，以及你的具体贡献。",
  management: "团队最近士气不高，有人觉得目标定得太高，你怎么沟通？",
};

export function simulateRoleplay(
  role: RoleplayRole,
  message: string,
  history: RoleplayMessage[],
): string {
  if (history.length === 0) return ROLEPLAY_OPENERS[role];

  const m = message.toLowerCase();
  if (role === "objection") {
    if (m.includes("tco") || m.includes("roi") || m.includes("价值"))
      return "嗯，TCO 这个说法有道理。那 pilot 的话最快多久能见到效果？";
    if (m.includes("pilot") || m.includes("试点"))
      return "可以，我们先从一个部门试点。合同条款里怎么保障数据安全？";
    return "你们能不能再优惠一点？我们采购部压力也很大。";
  }
  if (role === "complaint") {
    if (m.includes("抱歉") || m.includes("理解"))
      return "道歉我听过很多次了。我需要知道具体恢复时间和补偿方案。";
    if (m.includes("时间") || m.includes("小时"))
      return "好，如果这个时间内恢复，我可以先不升级。请把工单号发我邮箱。";
    return "我不想听借口，把你们主管叫来。";
  }
  if (role === "interview") {
    return "你提到的数据不错。如果项目中途需求变更，你是怎么平衡范围和进度的？";
  }
  return "说得有道理。如果有人仍然抵触，你会调整目标还是调整人？";
}

export function scoreRoleplay(
  role: RoleplayRole,
  conversation: RoleplayMessage[],
): RoleplayScore {
  const userMsgs = conversation.filter((m) => m.role === "user").length;
  const base = Math.min(95, 55 + userMsgs * 8);
  const dims =
    role === "objection"
      ? [
          { name: "倾听与共情", score: base - 5 },
          { name: "价值传递", score: base },
          { name: "推进下一步", score: base - 10 },
        ]
      : role === "complaint"
        ? [
            { name: "情绪安抚", score: base },
            { name: "方案清晰度", score: base - 8 },
            { name: "时效承诺", score: base - 3 },
          ]
        : [
            { name: "结构表达", score: base },
            { name: "深度思考", score: base - 6 },
            { name: "闭环意识", score: base - 4 },
          ];

  return {
    overall: Math.round(dims.reduce((a, d) => a + d.score, 0) / dims.length),
    dimensions: dims,
    highlights: ["回应及时，态度专业", "能引用公司标准话术"],
    improvements:
      userMsgs < 3
        ? ["对话轮次偏少，建议多追问客户需求", "可主动总结并确认下一步"]
        : ["可更早给出具体时间节点", "尝试用数据强化说服力"],
  };
}

export function generateQuiz(courseTitle: string): Quiz {
  const questions: QuizQuestion[] = [
    {
      id: "q1",
      type: "single",
      question: `${courseTitle}：我司产品最核心的价值主张是？`,
      options: ["最低价", "降本增效与合规一体化", "功能最多", "仅适合大企业"],
      correctAnswer: "降本增效与合规一体化",
      explanation: "话术手册强调价值三角，避免单纯价格战。",
    },
    {
      id: "q2",
      type: "multi",
      question: "客户提出「价格贵」时，合适的回应包括？（多选）",
      options: ["立即打对折", "TCO 对比", "Pilot 验证", "贬低竞品", "探因预算周期"],
      correctAnswer: ["TCO 对比", "Pilot 验证", "探因预算周期"],
      explanation: "先认同再探因，用 TCO 与 pilot 降低决策风险，禁止贬低竞品。",
    },
    {
      id: "q3",
      type: "scenario",
      question: "场景：客户在招标前要求「独家折扣承诺」，否则不邀标。你如何处理？",
      options: [
        "口头承诺最大折扣",
        "说明招标规则，提供标准阶梯价与增值服务包",
        "拒绝合作",
        "私下返点",
      ],
      correctAnswer: "说明招标规则，提供标准阶梯价与增值服务包",
      explanation: "须符合合规与招标公平，用标准方案替代口头承诺。",
    },
    {
      id: "q4",
      type: "short",
      question: "用一句话向 CFO 说明为什么值得在本季度启动 pilot。",
      correctAnswer: "pilot",
      explanation: "应包含：可控投入、可量化 ROI 窗口、风险边界（如部门范围/时长）。",
    },
  ];
  return {
    id: `quiz-${Date.now()}`,
    courseId: "c-active",
    title: `${courseTitle} · 阶段测验`,
    questions,
  };
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export function gradeQuiz(quiz: Quiz, answers: QuizAnswer[]): QuizGradeResult {
  const details = quiz.questions.map((q) => {
    const ans = answers.find((a) => a.questionId === q.id);
    let correct = false;
    if (q.type === "multi" && Array.isArray(q.correctAnswer)) {
      const exp = [...q.correctAnswer].sort().join(",");
      const got = Array.isArray(ans?.value)
        ? [...ans.value].sort().join(",")
        : "";
      correct = exp === got;
    } else if (q.type === "short") {
      correct =
        typeof ans?.value === "string" &&
        normalize(ans.value).includes(normalize(String(q.correctAnswer)));
    } else {
      correct = ans?.value === q.correctAnswer;
    }
    return { questionId: q.id, correct, explanation: q.explanation };
  });
  const score = details.filter((d) => d.correct).length;
  return { score, total: details.length, details };
}

export function generateLearningReport(user: Employee): ScoreReport {
  return {
    progressPercent: 58,
    quizAvg: 76,
    roleplayAvg: 72,
    skills: user.skills,
    weakPoints: user.weakSkills,
    nextSteps: [
      `完成「${PATH_TITLES[user.role]}」当前阶段陪练 3 次`,
      "本周完成《异议处理》测验并达 80 分",
      "预约导师复盘大客户方案呈现",
    ],
  };
}

export function getAllRolePaths(): LearningPath[] {
  return (["new_hire", "sales", "support", "manager"] as EmployeeRole[]).map(
    (role) => generateLearningPath({ role }),
  );
}
