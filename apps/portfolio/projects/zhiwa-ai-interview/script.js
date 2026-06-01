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
          <strong>批改结果</strong>
          <span>提出对策题</span>
        </div>
      </header>

      <section class="report-section question-summary">
        <p class="material-title">题目</p>
        <p>${essayReviewDemo.fields.question}</p>
        <p class="material-meta">要求：${essayReviewDemo.fields.requirement}</p>
      </section>

      <section class="report-section score-main">
        <div class="score-ring">
          <div class="score-inner">
            <div class="score-number">${essayReviewDemo.report.score}</div>
            <div class="score-total">/${essayReviewDemo.report.fullScore}</div>
          </div>
        </div>
        <div class="score-copy">
          <span class="stat-chip success">字数 ${wordCount} / ${essayReviewDemo.fields.numberMax}</span>
          <p>${essayReviewDemo.report.deduction}</p>
        </div>
      </section>

      <section class="report-section">
        <div class="section-title">五维评价</div>
        <div class="evaluation-bars">
          ${essayReviewDemo.report.dimensions
            .map(
              ([label, value]) => `
                <div class="evaluation-row">
                  <span>${label}</span>
                  <i><b style="--value: ${value}%"></b></i>
                  <strong>${value}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
      </section>

      <section class="report-section">
        <div class="section-title">原文批改</div>
        <div class="essay-paper">
          <div class="essay-segment">
            <span class="indent-space"></span><span class="text-good">一是建立统一诉求平台，将居民反映的问题集中收集</span><span class="score-stamp">${checkIcon()} 3分</span>，按维修、环境、停车、养老等类别生成工单，避免多头反馈和重复提交。
          </div>
          <div class="essay-segment">
            <span class="indent-space"></span><span class="text-good">二是明确街道、社区、物业和职能部门职责</span><span class="score-stamp">${checkIcon()} 3分</span>，由社区统一派单，相关部门限时办理。<span class="text-bad">相关部门</span>
            <div class="comment-block">${crossIcon()}这里还可以写清牵头单位、协办单位和办结时限。</div>
          </div>
          <div class="essay-segment">
            <span class="indent-space"></span><span class="text-good">三是对紧急事项、一般事项、高频事项分类处置</span><span class="score-stamp">${checkIcon()} 4分</span>，建立台账和销号机制。四是定期公示办理进度，设置回访和满意度评价，对未解决事项继续跟踪。
          </div>
          <div class="essay-segment">
            <span class="indent-space"></span>五是针对反复出现的管网维修、公共空间占用等问题，由街道牵头开展专项整治，形成常态化治理机制。<span class="text-bad">定期复盘办理时长、重复投诉和群众满意度</span>
            <div class="comment-block">${crossIcon()}这句话方向对，但还需要落到“如何反馈给责任部门、如何改进制度”。</div>
          </div>
        </div>
        <div class="correction-stats">
          <div><strong class="green">3</strong><span>命中要点</span></div>
          <div><strong class="red">2</strong><span>需补细节</span></div>
          <div><strong class="orange">5</strong><span>扣分</span></div>
        </div>
      </section>

      <section class="teacher-review">
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

function checkIcon() {
  return "<svg viewBox='0 0 24 24'><polyline points='20 6 9 17 4 12'></polyline></svg>";
}

function crossIcon() {
  return "<span class='icon-wrap'><svg class='icon-line' viewBox='0 0 24 24'><line x1='18' y1='6' x2='6' y2='18'></line><line x1='6' y1='6' x2='18' y2='18'></line></svg></span>";
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
