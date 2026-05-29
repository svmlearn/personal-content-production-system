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

const demoCases = {
  summary: {
    title: "归纳概括题",
    prompt: "请根据给定材料，概括基层治理中群众反馈集中的三个问题。",
    answer:
      "示例答案覆盖了办事流程复杂、信息公开不足和协同响应慢三个方向，但对材料中的具体表现提炼不够，部分表述停留在现象罗列。",
    scores: [
      ["要点覆盖", 78],
      ["概括准确", 72],
      ["结构表达", 84],
    ],
    review: [
      "优点：能抓住主要问题类别，分点表达清楚。",
      "扣分点：缺少对材料中高频矛盾的合并提炼，答案略显散。",
      "修改动作：把相近现象压缩成上位概念，并补充每类问题的典型表现。",
    ],
  },
  solution: {
    title: "提出对策题",
    prompt: "针对材料中公共服务响应慢的问题，提出可落地的改进措施。",
    answer:
      "示例答案提出了统一入口、限时办理和反馈回访，但没有把责任主体、执行步骤和监督方式写完整。",
    scores: [
      ["问题对应", 82],
      ["可执行性", 68],
      ["层次完整", 74],
    ],
    review: [
      "优点：对策方向基本匹配材料问题，没有偏题。",
      "扣分点：措施颗粒度偏粗，缺少谁来做、怎么做、如何评估。",
      "修改动作：每条对策按主体、动作、机制、结果四段展开。",
    ],
  },
  analysis: {
    title: "综合分析题",
    prompt: "请结合材料，谈谈你对数字化治理既要提效也要保温度的理解。",
    answer:
      "示例答案能提出效率与温度并重的观点，但论证链不够完整，对材料案例的引用还没有转化为论据。",
    scores: [
      ["观点明确", 86],
      ["论证深度", 70],
      ["材料结合", 66],
    ],
    review: [
      "优点：开头观点清楚，价值判断方向正确。",
      "扣分点：解释、分析、落脚之间缺少递进关系。",
      "修改动作：先解释概念，再用材料案例证明矛盾，最后落到治理原则。",
    ],
  },
};

const workflowButtons = [...document.querySelectorAll(".workflow-node")];
const workflowDetail = document.querySelector("#workflowDetail");
const demoButtons = [...document.querySelectorAll(".demo-tab")];
const demoPanel = document.querySelector("#demoPanel");

function renderWorkflow(key) {
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

function renderDemo(key) {
  const demo = demoCases[key] || demoCases.summary;
  demoButtons.forEach((button) => {
    const active = button.dataset.demo === key;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });

  demoPanel.innerHTML = `
    <div class="demo-question">
      <h3>${demo.title}</h3>
      <p><strong>题目：</strong>${demo.prompt}</p>
      <div class="answer-card">
        <p>${demo.answer}</p>
      </div>
    </div>
    <div class="demo-review">
      <h3>批改结果</h3>
      ${demo.scores
        .map(
          ([label, score]) => `
            <div class="score-row">
              <span>${label}</span>
              <div class="score-track" aria-hidden="true"><i style="--score: ${score}%"></i></div>
              <strong>${score}</strong>
            </div>
          `,
        )
        .join("")}
      <ul>
        ${demo.review.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>
  `;
}

workflowButtons.forEach((button) => {
  button.addEventListener("click", () => renderWorkflow(button.dataset.node));
});

demoButtons.forEach((button) => {
  button.addEventListener("click", () => renderDemo(button.dataset.demo));
});

renderWorkflow("capture");
renderDemo("summary");
