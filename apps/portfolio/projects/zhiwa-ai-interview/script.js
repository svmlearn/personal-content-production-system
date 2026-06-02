const essayReviewDemo = {
  fields: {
    question:
      "请根据给定材料，围绕社区老旧小区公共服务响应慢、协同弱的问题，提出可落地的改进措施。",
    requirement: "问题对应准确，措施具体可行，条理清楚，不超过300字。",
    score: "20",
    numberMax: "300",
  },
  demoAnswer:
    "一是建立统一诉求平台，将居民反映的问题集中收集，按维修、环境、停车、养老等类别生成工单，避免多头反馈和重复提交。二是明确街道、社区、物业和职能部门职责，由社区统一派单，相关部门限时办理。三是对紧急事项、一般事项、高频事项分类处置，建立台账和销号机制。四是定期公示办理进度，设置回访和满意度评价，对未解决事项继续跟踪。五是针对反复出现的管网维修、公共空间占用等问题，由街道牵头开展专项整治，形成常态化治理机制。同时依托网格员入户走访、居民议事会和线上平台补充问题线索，定期复盘办理时长、重复投诉和群众满意度，把临时处理转为制度改进。",
  report: {
    score: 15,
    fullScore: 20,
    percentile: "68%",
    duration: "26分32秒",
    durationLevel: "时长适中",
    deduction: "要点覆盖不足扣3分；对策论证不够具体扣2分",
    dimensions: [
      ["审题能力", 82],
      ["语言表达", 76],
      ["逻辑结构", 80],
      ["要点覆盖", 68],
      ["政治素养", 72],
    ],
    missed: [
      ["没有区分高频诉求和突发诉求", "-2分"],
      ["监督反馈闭环写得较粗", "-1.5分"],
      ["专项整治缺少责任牵头主体", "-1.5分"],
    ],
  },
};

const loadingSteps = ["整理作答内容", "匹配评分维度", "生成批改报告"];
const answerInput = document.querySelector("#answerInput");
const prefillButton = document.querySelector("#prefillAnswer");
const runButton = document.querySelector("#runReview");
const phoneReport = document.querySelector("#phoneReport");
let runTimers = [];

function clearRunTimers() {
  runTimers.forEach((timer) => window.clearTimeout(timer));
  runTimers = [];
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

function renderPhoneLoading(step) {
  if (!phoneReport) return;

  phoneReport.innerHTML = `
    <div class="phone-loading-state">
      <div class="loading-ring" aria-hidden="true"></div>
      <span>正在生成报告</span>
      <h3>${step}</h3>
      <p>正在整理题目、答案和评分维度。</p>
    </div>
  `;
}

function renderPhoneReport(answer) {
  if (!phoneReport) return;

  const wordCount = answer.replace(/\s/g, "").length;

  phoneReport.innerHTML = `
    <div class="mobile-report">
      <header class="report-nav">
        <button type="button" aria-label="返回">
          <span aria-hidden="true">‹</span>
        </button>
        <div>
          <strong>申论报告</strong>
          <span>提出对策题</span>
        </div>
        <span class="score-help">分数说明</span>
      </header>

      <section class="report-section official-score-card">
        <div class="score-main">
          <div class="score-ring">
            <div class="score-inner">
              <div class="score-number">${essayReviewDemo.report.score}</div>
              <div class="score-total">/${essayReviewDemo.report.fullScore}</div>
            </div>
          </div>
          <div class="score-copy">
            <span class="stat-chip success">总分：${essayReviewDemo.report.fullScore} 分</span>
            <span class="word-chip">字数 ${wordCount} / ${essayReviewDemo.fields.numberMax}</span>
          </div>
        </div>
        <div class="score-facts">
          <div>
            <span class="fact-icon">↗</span>
            <p><small>击败考生</small><strong>超过 ${essayReviewDemo.report.percentile} 考生</strong></p>
          </div>
          <div>
            <span class="fact-icon">◷</span>
            <p><small>作答用时</small><strong>${essayReviewDemo.report.duration} <em>${essayReviewDemo.report.durationLevel}</em></strong></p>
          </div>
        </div>
        <p class="deduction-strip">${essayReviewDemo.report.deduction}</p>
      </section>

      <section class="report-section question-summary">
        <div class="report-card-title">
          <span></span>
          <strong>题目</strong>
          <small>字数要求 ${essayReviewDemo.fields.numberMax}</small>
        </div>
        <p>${essayReviewDemo.fields.question}</p>
        <p class="material-meta">要求：${essayReviewDemo.fields.requirement}</p>
        <button class="reference-toggle" type="button">查看参考解析</button>
      </section>

      <section class="report-section">
        <div class="section-title">五维评价</div>
        <div class="radar-block">
          ${renderRadarChart(essayReviewDemo.report.dimensions)}
        </div>
      </section>

      <section class="report-section">
        <div class="report-card-title">
          <span></span>
          <strong>原文批改</strong>
        </div>
        <div class="report-tabs" aria-hidden="true">
          <span class="active">我的答案</span>
          <span>修改后答案</span>
        </div>
        <div class="essay-paper original-answer-sheet">
          <h4>
            <span class="text-good">社区治理要以统一入口和闭环反馈提质增效</span>
            <span class="score-stamp">${checkIcon()} 好标题</span>
          </h4>
          <div class="essay-segment">
            <span class="text-good">一是建立统一诉求平台，将居民反映的问题集中收集</span><span class="score-stamp">+3</span>，按维修、环境、停车、养老等类别生成工单，避免多头反馈和重复提交。
          </div>
          <div class="essay-segment">
            <span class="text-good">二是明确街道、社区、物业和职能部门职责</span><span class="score-stamp">+3</span>，由社区统一派单，相关部门限时办理。<span class="text-bad">相关部门</span>的牵头单位、协办单位和办结时限还可以写得更明确。
          </div>
          <div class="essay-segment">
            <span class="text-good">三是对紧急事项、一般事项、高频事项分类处置</span><span class="score-stamp">+4</span>，建立台账和销号机制。四是定期公示办理进度，设置回访和满意度评价，对未解决事项继续跟踪。
          </div>
          <div class="essay-segment">
            五是针对反复出现的管网维修、公共空间占用等问题，由街道牵头开展专项整治，形成常态化治理机制。<span class="text-bad">定期复盘办理时长、重复投诉和群众满意度</span>方向正确，但还需要落到“如何反馈给责任部门、如何改进制度”。
          </div>
        </div>
      </section>

      <section class="teacher-review official-review">
        <div class="teacher-review-title">批改评语</div>
        <p><span class="point-good">优点：</span>答案能够围绕统一入口、分类派单、限时办理和回访监督展开，方向准确，措施之间有层次。</p>
        <p><span class="point-bad">不足：</span>部分表达仍停留在机制概念，责任牵头、分级处置和制度复盘写得不够实。</p>
      </section>

      <section class="revised-answer-card">
        <div class="revised-answer-header">
          <span class="revised-answer-icon">✦</span>
          <span class="revised-answer-title">修改后答案</span>
        </div>
        <div class="revised-answer-content">
          <p>建立社区诉求统一入口，由社区牵头分类派单，街道、物业和职能部门按职责限时办理；对维修、停车、环境等高频事项建立专项台账，<span class="change-mark">明确责任人、办结时限和回访标准</span>；处理进度定期公开，接受居民监督，形成收集、派单、办理、反馈的闭环。</p>
        </div>
      </section>
    </div>
  `;
}

function renderRadarChart(dimensions) {
  const center = 96;
  const radius = 58;
  const points = dimensions.map(([, value], index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / dimensions.length;
    const distance = radius * (value / 100);
    return [center + Math.cos(angle) * distance, center + Math.sin(angle) * distance];
  });
  const grid = [0.25, 0.5, 0.75, 1]
    .map((scale) => {
      const ring = dimensions
        .map((_, index) => {
          const angle = -Math.PI / 2 + (index * 2 * Math.PI) / dimensions.length;
          return `${center + Math.cos(angle) * radius * scale},${center + Math.sin(angle) * radius * scale}`;
        })
        .join(" ");
      return `<polygon points="${ring}" class="radar-grid-ring"></polygon>`;
    })
    .join("");
  const axis = dimensions
    .map((_, index) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / dimensions.length;
      return `<line x1="${center}" y1="${center}" x2="${center + Math.cos(angle) * radius}" y2="${center + Math.sin(angle) * radius}" class="radar-axis"></line>`;
    })
    .join("");
  const labels = dimensions
    .map(([label], index) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / dimensions.length;
      const x = center + Math.cos(angle) * (radius + 24);
      const y = center + Math.sin(angle) * (radius + 24);
      return `<text x="${x}" y="${y}" class="radar-label" text-anchor="middle" dominant-baseline="middle">${label}</text>`;
    })
    .join("");
  const shape = points.map(([x, y]) => `${x},${y}`).join(" ");

  return `
    <svg class="radar-chart" viewBox="0 0 192 192" role="img" aria-label="五维评价雷达图">
      ${grid}
      ${axis}
      <polygon points="${shape}" class="radar-area"></polygon>
      <polyline points="${shape} ${points[0][0]},${points[0][1]}" class="radar-line"></polyline>
      ${labels}
    </svg>
  `;
}

function checkIcon() {
  return "<svg viewBox='0 0 24 24'><polyline points='20 6 9 17 4 12'></polyline></svg>";
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

  loadingSteps.forEach((step, index) => {
    const timer = window.setTimeout(() => {
      renderPhoneLoading(step);
    }, index * 520);
    runTimers.push(timer);
  });

  const finishTimer = window.setTimeout(() => {
    renderPhoneReport(answer);
    runButton.disabled = false;
    prefillButton.disabled = false;
    runButton.textContent = "重新批改";
  }, loadingSteps.length * 520 + 360);
  runTimers.push(finishTimer);
}

if (prefillButton) {
  prefillButton.addEventListener("click", prefillDemoAnswer);
}

if (runButton) {
  runButton.addEventListener("click", runEssayReview);
}

renderPhoneIdle();
