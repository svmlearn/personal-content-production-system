const workflowNodes = {
  capture: {
    code: "NODE 01",
    title: "OCR 收卷与素材标准化",
    body:
      "把拍照上传、截图和文本输入统一成可批改材料，先解决申论场景里答案载体不稳定的问题，再进入后续评分。",
    bullets: [
      "清理题干、材料、作答区域的混杂文本",
      "识别答案段落和明显缺漏，减少无效批改",
      "保留题型、字数和材料来源等上下文",
    ],
    outputs: ["可批改文本", "题干上下文", "输入质量提示"],
  },
  classify: {
    code: "NODE 02",
    title: "题型识别与批改策略路由",
    body:
      "不同申论题型的评分重心不同。工作流先判断归纳概括、提出对策、综合分析等类型，再切换对应批改标准。",
    bullets: [
      "归纳概括看要点覆盖和表达压缩",
      "提出对策看问题对应、可执行性和层次",
      "综合分析看观点、论证链和材料结合",
    ],
    outputs: ["题型标签", "评分模板", "风险提醒"],
  },
  rubric: {
    code: "NODE 03",
    title: "评分规则产品化",
    body:
      "把老师批改中的判断拆成维度、权重和评语口径，避免 AI 只给笼统鼓励，形成稳定的教育反馈标准。",
    bullets: [
      "拆分内容完整度、结构清晰度、材料对应度",
      "把扣分原因写成用户能执行的修改动作",
      "控制评语语气，强调备考场景里的可改进性",
    ],
    outputs: ["维度分", "扣分点", "修改动作"],
  },
  review: {
    code: "NODE 04",
    title: "批改报告与学习反馈",
    body:
      "批改结果不是单个分数，而是要让用户知道哪里丢分、为什么丢分、下一版答案应该怎么调整。",
    bullets: [
      "输出总评、维度分和核心问题",
      "标注答案中的薄弱表达和遗漏要点",
      "给出可直接复写的结构建议",
    ],
    outputs: ["总评报告", "逐项建议", "改写方向"],
  },
  plan: {
    code: "NODE 05",
    title: "学习建议与后续转化",
    body:
      "把一次批改转成下一次训练入口，连接面试热点、申论题库、专项练习和付费权益，延长用户生命周期。",
    bullets: [
      "根据薄弱维度推荐同类题和热点材料",
      "把报告价值点映射到付费权益说明",
      "为后续周报和学习计划保留结构化数据",
    ],
    outputs: ["练习推荐", "权益承接", "学习计划"],
  },
};

const essayReviewDemo = {
  fields: {
    information:
      "材料围绕老旧小区公共服务响应慢、部门协同弱、居民诉求反复提交、维修事项闭环不足等问题展开。",
    question:
      "请根据给定材料，围绕社区老旧小区公共服务响应慢、协同弱的问题，提出可落地的改进措施。",
    requirement: "问题对应准确，措施具体可行，条理清楚，不超过300字。",
    score: "20",
    numberMin: "250",
    numberMax: "300",
    standardAnswer:
      "建立统一诉求入口；明确街道、社区、物业、职能部门责任；设置限时办结和回访机制；公开进度并接受居民监督；针对高频问题建立专项治理台账。",
  },
  demoAnswer:
    "一是建立统一诉求平台，将居民反映的问题集中收集，按维修、环境、停车、养老等类别生成工单，避免多头反馈和重复提交。二是明确街道、社区、物业和职能部门职责，由社区统一派单，相关部门限时办理。三是对紧急事项、一般事项、高频事项分类处置，建立台账和销号机制。四是定期公示办理进度，设置回访和满意度评价，对未解决事项继续跟踪。五是针对反复出现的管网维修、公共空间占用等问题，由街道牵头开展专项整治，形成常态化治理机制。同时依托网格员入户走访、居民议事会和线上平台补充问题线索，定期复盘办理时长、重复投诉和群众满意度，把临时处理转为制度改进。",
  report: {
    score: 15,
    fullScore: 20,
    wordLimit: 300,
    deduction: "遗漏高频问题分级治理细节，部分措施还停留在机制层面。",
    dimensions: [
      ["问题对应", 82],
      ["可执行性", 76],
      ["层次完整", 80],
      ["材料转化", 68],
      ["表达规范", 84],
    ],
    missed: [
      ["没有区分高频诉求和突发诉求", "-2分"],
      ["监督反馈闭环写得较粗", "-1.5分"],
      ["专项整治缺少责任牵头主体", "-1.5分"],
    ],
  },
};

const reviewRunNodes = [
  {
    title: "字数检测",
    detail: "读取 answer 与 number_max，计算字数和字数扣分。",
  },
  {
    title: "要点拆分老师",
    detail: "用 standardanswer 拆分评分骨架，固定主点数量和分值闭环。",
  },
  {
    title: "材料精读",
    detail: "读取 information、question、requirement，理解问题链和对策方向。",
  },
  {
    title: "评分判断老师",
    detail: "对 answer 逐段标注命中要点、遗漏要点和表达问题。",
  },
  {
    title: "代码算分",
    detail: "根据命中 sub_id、遗漏项和字数扣分计算最终分数。",
  },
  {
    title: "报告整合",
    detail: "输出总评、原文批改、修改后答案、五维评价和练习建议。",
  },
];

const workflowButtons = [...document.querySelectorAll(".workflow-node")];
const workflowDetail = document.querySelector("#workflowDetail");
const answerInput = document.querySelector("#answerInput");
const prefillButton = document.querySelector("#prefillAnswer");
const runButton = document.querySelector("#runReview");
const runnerSteps = document.querySelector("#runnerSteps");
const phoneReport = document.querySelector("#phoneReport");
let runTimers = [];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderWorkflow(key) {
  if (!workflowDetail) return;

  const node = workflowNodes[key] || workflowNodes.capture;
  workflowButtons.forEach((button) => {
    const active = button.dataset.node === key;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });

  workflowDetail.innerHTML = `
    <span class="node-code">${node.code}</span>
    <h3>${node.title}</h3>
    <p>${node.body}</p>
    <ul>
      ${node.bullets.map((item) => `<li>${item}</li>`).join("")}
    </ul>
    <div class="node-output" aria-label="节点输出">
      ${node.outputs.map((item) => `<span>${item}</span>`).join("")}
    </div>
  `;
}

function clearRunTimers() {
  runTimers.forEach((timer) => window.clearTimeout(timer));
  runTimers = [];
}

function renderRunner(activeIndex = -1, completed = false) {
  if (!runnerSteps) return;

  runnerSteps.innerHTML = reviewRunNodes
    .map((node, index) => {
      const status = completed || index < activeIndex ? "done" : index === activeIndex ? "running" : "waiting";
      const statusText = status === "done" ? "完成" : status === "running" ? "运行中" : "等待";

      return `
        <div class="runner-step ${status}">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>${node.title}</strong>
            <p>${node.detail}</p>
          </div>
          <em>${statusText}</em>
        </div>
      `;
    })
    .join("");
}

function renderPhoneIdle() {
  if (!phoneReport) return;

  phoneReport.innerHTML = `
    <div class="phone-empty-state">
      <span>Essay Review</span>
      <h3>申论批改报告</h3>
      <p>运行批改后，这里会生成移动端结构化报告。</p>
    </div>
  `;
}

function renderPhoneLoading(nodeTitle) {
  if (!phoneReport) return;

  phoneReport.innerHTML = `
      <div class="phone-loading-state">
        <div class="loading-ring" aria-hidden="true"></div>
        <span>正在生成报告</span>
        <h3>${nodeTitle}</h3>
      <p>正在模拟 Dify 工作流处理题目、答案、参考答案和评分约束。</p>
      </div>
  `;
}

function renderPhoneReport(answer) {
  if (!phoneReport) return;

  const safeAnswer = escapeHtml(answer);
  const wordCount = answer.replace(/\s/g, "").length;
  const answerPreview = safeAnswer.length > 78 ? `${safeAnswer.slice(0, 78)}...` : safeAnswer;

  phoneReport.innerHTML = `
    <div class="mobile-report">
      <header class="mobile-report-header">
        <span>批改结果</span>
        <h3>提出对策题</h3>
        <p>社区公共服务响应优化</p>
      </header>

      <section class="phone-card compact-question">
        <span>题目</span>
        <p>${essayReviewDemo.fields.question}</p>
        <small>${essayReviewDemo.fields.requirement}</small>
      </section>

      <section class="phone-card score-summary">
        <div class="phone-score-ring">
          <strong>${essayReviewDemo.report.score}</strong>
          <span>/${essayReviewDemo.report.fullScore}</span>
        </div>
        <div>
          <span class="phone-chip">字数 ${wordCount} / ${essayReviewDemo.fields.numberMax}</span>
          <p>${essayReviewDemo.report.deduction}</p>
        </div>
      </section>

      <section class="phone-card">
        <h4>五维评价</h4>
        <div class="phone-dimensions">
          ${essayReviewDemo.report.dimensions
            .map(
              ([label, value]) => `
                <div class="phone-dimension">
                  <span>${label}</span>
                  <i><b style="--value: ${value}%"></b></i>
                  <strong>${value}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
      </section>

      <section class="phone-card">
        <h4>原文批改</h4>
        <p class="answer-preview">${answerPreview}</p>
        <div class="correction-line hit">
          <strong>+3</strong>
          <span>统一诉求入口、分类处理、限时办结均有命中。</span>
        </div>
        <div class="correction-line miss">
          <strong>-2</strong>
          <span>高频问题台账与专项治理责任主体还不够具体。</span>
        </div>
      </section>

      <section class="phone-card">
        <h4>遗漏要点</h4>
        <div class="missed-list">
          ${essayReviewDemo.report.missed
            .map(
              ([text, score]) => `
                <div>
                  <span>${text}</span>
                  <strong>${score}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
      </section>

      <section class="phone-card teacher-card">
        <h4>批改评语</h4>
        <p>这份答案方向正确，能围绕响应慢、协同弱提出机制化措施。主要问题是部分对策还停在“建立机制”的层面，没有把牵头主体、处理分级和反馈闭环写实。</p>
      </section>

      <section class="phone-card revised-card">
        <h4>修改后答案</h4>
        <p>建立社区诉求统一入口，由社区牵头分类派单，街道、物业和职能部门按职责限时办理；对维修、停车、环境等高频事项建立专项台账，明确责任人、办结时限和回访标准；处理进度定期公开，接受居民监督，形成收集、派单、办理、反馈的闭环。</p>
      </section>
    </div>
  `;
}

function prefillDemoAnswer() {
  if (!answerInput) return;

  answerInput.value = essayReviewDemo.demoAnswer;
  answerInput.focus();
}

function runEssayReview() {
  if (!answerInput || !runButton || !prefillButton) return;

  clearRunTimers();

  if (!answerInput.value.trim()) {
    answerInput.value = essayReviewDemo.demoAnswer;
  }

  const answer = answerInput.value.trim();
  runButton.disabled = true;
  prefillButton.disabled = true;
  runButton.textContent = "批改中...";

  reviewRunNodes.forEach((node, index) => {
    const timer = window.setTimeout(() => {
      renderRunner(index);
      renderPhoneLoading(node.title);
    }, index * 420);
    runTimers.push(timer);
  });

  const finishTimer = window.setTimeout(() => {
    renderRunner(-1, true);
    renderPhoneReport(answer);
    runButton.disabled = false;
    prefillButton.disabled = false;
    runButton.textContent = "重新批改";
  }, reviewRunNodes.length * 420 + 260);
  runTimers.push(finishTimer);
}

workflowButtons.forEach((button) => {
  button.addEventListener("click", () => renderWorkflow(button.dataset.node));
});

if (prefillButton) {
  prefillButton.addEventListener("click", prefillDemoAnswer);
}

if (runButton) {
  runButton.addEventListener("click", runEssayReview);
}

renderWorkflow("capture");
renderRunner();
renderPhoneIdle();
