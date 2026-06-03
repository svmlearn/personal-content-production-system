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

const interviewReviewDemo = {
  fields: {
    questionType: "社会现象题",
    question: "面对网上出现的突发负面舆情，基层单位应该如何回应？",
    analysis:
      "本题考查应急处突、群众沟通、舆情回应和基层治理闭环。高分答案需要先核实事实，再公开回应，随后推动问题办理和机制复盘。",
    modelAnswer:
      "面对突发负面舆情，基层单位应坚持实事求是、主动回应、依法依规和解决问题并重。先核实事实，统一口径；再通过官方渠道回应群众关切；随后明确责任人和处理时限，推动实际问题整改；最后复盘制度短板，完善监测预警和应急响应机制。",
    usedTime: 96,
  },
  demoAnswer:
    "各位考官，面对突发负面舆情，我会先核实事实、回应关切，再推动问题处置。具体来说，第一时间联系业务部门和现场人员，查清事件原因、影响范围和群众诉求；同步通过官方渠道发布简明说明，避免信息空窗导致误解扩散。随后建立办理台账，明确责任人、处理时限和反馈口径，对群众合理诉求及时解决，对不实信息依法澄清。最后复盘舆情背后的服务短板，完善日常监测和应急回应机制。",
  report: {
    score: 78,
    fullScore: 100,
    abilityType: "表达待优化型",
    diagnosis:
      "整体思路完整，能覆盖核实、回应、办理和复盘四个动作；短板在于措施颗粒度不足，部分句子偏工作汇报，现场感和考官听感还可以加强。",
    dimensions: [
      {
        key: "language_expression",
        label: "语言表达",
        score: 15,
        analysis: "表达基本流畅，书面化程度较好，但感染力不足。",
      },
      {
        key: "civil_service_literacy",
        label: "公职素养",
        score: 16,
        analysis: "能体现主动回应、群众关切和责任意识。",
      },
      {
        key: "comprehensive_ability",
        label: "综合能力",
        score: 15,
        analysis: "流程完整，但处置动作还可以更具体。",
      },
      {
        key: "political_thinking",
        label: "政务思维",
        score: 17,
        analysis: "政府视角明确，兼顾事实核查和依法澄清。",
      },
      {
        key: "adaptability_control",
        label: "应变控制",
        score: 15,
        analysis: "时间控制合理，临场层次稳定。",
      },
    ],
    sentenceAnalysis: [
      {
        type: "highlight",
        title: "破题清楚",
        display: "+2分",
        evaluation: "开头先给出核实、回应、处置的主线，能让考官快速听到答题框架。",
        originalText: "我会先核实事实、回应关切，再推动问题处置。",
        suggestion: "",
        accumulation: "热点舆情题可优先使用“核实事实、公开回应、推动整改、复盘机制”的四步框架。",
      },
      {
        type: "critique",
        title: "措施偏粗",
        display: "-3分",
        evaluation: "说明了查清事实，但没有展开谁来核查、多久反馈、如何防止口径冲突。",
        originalText: "第一时间联系业务部门和现场人员，查清事件原因、影响范围和群众诉求。",
        suggestion: "可补成：由办公室牵头会同业务科室、属地社区和现场负责人，在2小时内形成事实核查单和初步回应口径。",
        accumulation: "",
      },
      {
        type: "weakness",
        title: "升华不足",
        display: "-2分",
        evaluation: "结尾有机制复盘意识，但没有点出基层治理能力现代化或群众路线，收束力度偏弱。",
        originalText: "最后复盘舆情背后的服务短板，完善日常监测和应急回应机制。",
        suggestion: "结尾可升华到“把一次舆情处置转化为改进服务、回应群众、提升治理能力的契机”。",
        accumulation: "",
      },
    ],
    fillerWords: [
      { word: "然后", count: 1 },
      { word: "这个", count: 0 },
      { word: "呃", count: 0 },
    ],
    polishedAnswer:
      "各位考官，突发负面舆情既是对基层回应速度的考验，也是改进公共服务的提醒。我会坚持实事求是、主动公开、解决问题的原则分步处理。第一，快速核实情况。由单位牵头联系业务科室、属地社区和现场负责人，尽快查明事件起因、影响范围、群众诉求和当前处置进展，形成统一事实口径。第二，及时回应关切。通过官方账号、社区公告等渠道发布简明说明，对属实问题说明整改安排，对不实信息依法澄清，避免信息空窗扩大误解。第三，推动问题办理。建立台账，明确责任人、办结时限和反馈方式，对合理诉求马上办、跟踪办、公开办。第四，做好复盘提升。把舆情暴露出的流程漏洞、服务短板纳入整改清单，完善日常监测、群众沟通和应急回应机制，真正把一次处置转化为提升基层治理能力的契机。",
    practiceRecommendations: [
      {
        type: "专项强化",
        questionType: "应急应变",
        question: "群众在政务大厅因等待时间过长情绪激动，并拍摄视频准备上传网络，你会如何处理？",
        reason: "针对你在时限、责任主体和现场回应上的细节不足继续训练。",
      },
      {
        type: "深度提升",
        questionType: "组织管理",
        question: "单位准备建立群众诉求快速响应机制，领导让你负责前期调研和方案设计，你会怎么开展？",
        reason: "强化从单次舆情处置延伸到制度复盘和流程建设的能力。",
      },
    ],
  },
};

const essayLoadingSteps = ["整理作答内容", "匹配评分维度", "生成批改报告"];
const interviewLoadingSteps = ["解析题型与作答时长", "并行生成五维评分", "生成面试报告"];

const answerInput = document.querySelector("#answerInput");
const prefillButton = document.querySelector("#prefillAnswer");
const runButton = document.querySelector("#runReview");
const phoneReport = document.querySelector("#phoneReport");

const interviewAnswerInput = document.querySelector("#interviewAnswerInput");
const prefillInterviewButton = document.querySelector("#prefillInterviewAnswer");
const runInterviewButton = document.querySelector("#runInterviewReview");
const interviewPhoneReport = document.querySelector("#interviewPhoneReport");

let essayRunTimers = [];
let interviewRunTimers = [];

function clearTimers(timerBucket) {
  timerBucket.forEach((timer) => window.clearTimeout(timer));
  timerBucket.length = 0;
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

function renderInterviewPhoneIdle() {
  if (!interviewPhoneReport) return;

  interviewPhoneReport.innerHTML = `
    <div class="phone-empty-state">
      <span>Interview Review</span>
      <h3>面试评分报告</h3>
      <p>生成报告后，这里会展示五维评分、逐句分析和答案润色。</p>
    </div>
  `;
}

function renderPhoneLoading(step) {
  if (!phoneReport) return;

  phoneReport.innerHTML = `
    <div class="mobile-report phone-loading-report">
      <header class="report-nav">
        <button type="button" aria-label="返回">
          <span aria-hidden="true">‹</span>
        </button>
        <div>
          <strong>申论报告</strong>
          <span>生成中</span>
        </div>
        <span class="score-help">分数说明</span>
      </header>

      <section class="report-section official-score-card loading-score-card">
        <div class="score-main">
          <div class="score-ring loading-score-ring">
            <div class="loading-ring" aria-hidden="true"></div>
          </div>
          <div class="score-copy">
            <span class="stat-chip success">正在生成</span>
            <span class="word-chip">${step}</span>
          </div>
        </div>
        <div class="score-facts loading-score-facts" aria-hidden="true">
          <div>
            <span class="fact-icon">↗</span>
            <p><small>匹配规则</small><strong></strong></p>
          </div>
          <div>
            <span class="fact-icon">◷</span>
            <p><small>整理维度</small><strong></strong></p>
          </div>
        </div>
        <p class="deduction-strip loading-deduction">正在整理题目、答案和评分维度。</p>
      </section>

      <section class="report-section loading-skeleton-card" aria-hidden="true">
        <i class="skeleton-pill"></i>
        <i class="skeleton-line wide"></i>
        <i class="skeleton-line"></i>
        <i class="skeleton-line short"></i>
      </section>

      <section class="report-section loading-skeleton-card" aria-hidden="true">
        <i class="skeleton-pill"></i>
        <i class="skeleton-line wide"></i>
        <i class="skeleton-line"></i>
        <i class="skeleton-line"></i>
      </section>
    </div>
  `;
}

function renderInterviewPhoneLoading(step) {
  if (!interviewPhoneReport) return;

  interviewPhoneReport.innerHTML = `
    <div class="mobile-report phone-loading-report">
      <header class="report-nav">
        <button type="button" aria-label="返回">
          <span aria-hidden="true">‹</span>
        </button>
        <div>
          <strong>面试报告</strong>
          <span>生成中</span>
        </div>
        <span class="score-help">单题评估</span>
      </header>

      <section class="report-section interview-score-card loading-score-card">
        <div class="interview-score-ring loading-score-ring">
          <div class="loading-ring" aria-hidden="true"></div>
        </div>
        <div class="interview-score-copy">
          <span class="ability-chip">正在生成</span>
          <h4>${step}</h4>
          <p>正在并行处理五维评分、逐句分析和答案润色。</p>
        </div>
        <div class="interview-meta-strip loading-meta-strip" aria-hidden="true">
          <span>五维评分</span>
          <span>逐句分析</span>
          <span>答案润色</span>
        </div>
      </section>

      <section class="report-section loading-skeleton-card" aria-hidden="true">
        <i class="skeleton-pill"></i>
        <i class="skeleton-line wide"></i>
        <i class="skeleton-line"></i>
        <i class="skeleton-line short"></i>
      </section>

      <section class="report-section loading-skeleton-card" aria-hidden="true">
        <i class="skeleton-pill"></i>
        <i class="skeleton-line wide"></i>
        <i class="skeleton-line"></i>
        <i class="skeleton-line"></i>
      </section>
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

function renderInterviewPhoneReport(answer) {
  if (!interviewPhoneReport) return;

  const cleanAnswer = answer.trim();
  const wordCount = cleanAnswer.replace(/\s/g, "").length;
  const report = interviewReviewDemo.report;
  const answerPreview =
    cleanAnswer.length > 82 ? `${escapeHtml(cleanAnswer.slice(0, 82))}...` : escapeHtml(cleanAnswer);

  interviewPhoneReport.innerHTML = `
    <div class="mobile-report interview-mobile-report">
      <header class="report-nav">
        <button type="button" aria-label="返回">
          <span aria-hidden="true">‹</span>
        </button>
        <div>
          <strong>面试报告</strong>
          <span>${interviewReviewDemo.fields.questionType}</span>
        </div>
        <span class="score-help">单题评估</span>
      </header>

      <section class="report-section interview-score-card">
        <div class="interview-score-ring" style="--score-percent: ${report.score}%">
          <strong>${report.score}</strong>
          <span>/${report.fullScore}</span>
        </div>
        <div class="interview-score-copy">
          <span class="ability-chip">${report.abilityType}</span>
          <h4>五维综合表现良好</h4>
          <p>${report.diagnosis}</p>
        </div>
        <div class="interview-meta-strip">
          <span>作答 ${interviewReviewDemo.fields.usedTime} 秒</span>
          <span>字数 ${wordCount}</span>
          <span>口头禅 ${report.fillerWords.reduce((sum, item) => sum + item.count, 0)} 次</span>
        </div>
      </section>

      <section class="report-section question-summary">
        <div class="report-card-title">
          <span></span>
          <strong>题目</strong>
          <small>${interviewReviewDemo.fields.questionType}</small>
        </div>
        <p>${interviewReviewDemo.fields.question}</p>
        <p class="material-meta">${interviewReviewDemo.fields.analysis}</p>
      </section>

      <section class="report-section">
        <div class="report-card-title">
          <span></span>
          <strong>五维评分</strong>
          <small>每项 20 分</small>
        </div>
        <div class="dimension-list">
          ${renderDimensionBars(report.dimensions)}
        </div>
      </section>

      <section class="report-section answer-snapshot">
        <div class="report-card-title">
          <span></span>
          <strong>作答摘要</strong>
          <small>学员原话</small>
        </div>
        <p>${answerPreview}</p>
      </section>

      <section class="report-section">
        <div class="report-card-title">
          <span></span>
          <strong>逐句分析</strong>
          <small>亮点 / 不足</small>
        </div>
        <div class="sentence-list">
          ${renderSentenceAnalysis(report.sentenceAnalysis)}
        </div>
      </section>

      <section class="teacher-review interview-diagnosis">
        <div class="teacher-review-title">口头禅统计</div>
        <div class="filler-cloud">
          ${renderFillerWords(report.fillerWords)}
        </div>
      </section>

      <section class="revised-answer-card">
        <div class="revised-answer-header">
          <span class="revised-answer-icon">✦</span>
          <span class="revised-answer-title">润色后高分答案</span>
        </div>
        <div class="revised-answer-content polished-answer">
          <p>${report.polishedAnswer}</p>
        </div>
      </section>

      <section class="report-section">
        <div class="report-card-title">
          <span></span>
          <strong>AI 加练推荐</strong>
          <small>2 道推荐题</small>
        </div>
        <div class="practice-list">
          ${renderPracticeRecommendations(report.practiceRecommendations)}
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

function renderDimensionBars(dimensions) {
  return dimensions
    .map(
      (dimension) => `
        <div class="dimension-row">
          <div class="dimension-row-head">
            <strong>${dimension.label}</strong>
            <span>${dimension.score}/20</span>
          </div>
          <div class="dimension-meter" aria-hidden="true">
            <i style="width: ${dimension.score * 5}%"></i>
          </div>
          <p>${dimension.analysis}</p>
        </div>
      `,
    )
    .join("");
}

function renderSentenceAnalysis(items) {
  return items
    .map(
      (item) => `
        <article class="sentence-card ${item.type}">
          <div class="sentence-card-head">
            <strong>${item.title}</strong>
            <span>${item.display}</span>
          </div>
          <p class="sentence-original">“${item.originalText}”</p>
          <p>${item.evaluation}</p>
          ${
            item.suggestion
              ? `<p class="sentence-suggestion"><b>建议：</b>${item.suggestion}</p>`
              : `<p class="sentence-suggestion"><b>积累：</b>${item.accumulation}</p>`
          }
        </article>
      `,
    )
    .join("");
}

function renderFillerWords(words) {
  return words
    .map(
      (item) => `
        <span>
          <strong>${item.word}</strong>
          <em>${item.count} 次</em>
        </span>
      `,
    )
    .join("");
}

function renderPracticeRecommendations(items) {
  return items
    .map(
      (item, index) => `
        <article class="practice-card">
          <div class="practice-card-head">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <strong>${item.type}</strong>
            <em>${item.questionType}</em>
          </div>
          <p>${item.question}</p>
          <small>${item.reason}</small>
        </article>
      `,
    )
    .join("");
}

function checkIcon() {
  return "<svg viewBox='0 0 24 24'><polyline points='20 6 9 17 4 12'></polyline></svg>";
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });
}

function prefillDemoAnswer() {
  if (!answerInput) return;

  answerInput.value = essayReviewDemo.demoAnswer;
  answerInput.focus();
}

function prefillInterviewAnswer() {
  if (!interviewAnswerInput) return;

  interviewAnswerInput.value = interviewReviewDemo.demoAnswer;
  interviewAnswerInput.focus();
}

function runEssayReview() {
  if (!answerInput || !runButton || !prefillButton) return;

  clearTimers(essayRunTimers);

  if (!answerInput.value.trim()) {
    answerInput.value = essayReviewDemo.demoAnswer;
  }

  const answer = answerInput.value.trim();
  runButton.disabled = true;
  prefillButton.disabled = true;
  runButton.textContent = "批改中...";

  essayLoadingSteps.forEach((step, index) => {
    const timer = window.setTimeout(() => {
      renderPhoneLoading(step);
    }, index * 520);
    essayRunTimers.push(timer);
  });

  const finishTimer = window.setTimeout(() => {
    renderPhoneReport(answer);
    runButton.disabled = false;
    prefillButton.disabled = false;
    runButton.textContent = "重新批改";
  }, essayLoadingSteps.length * 520 + 360);
  essayRunTimers.push(finishTimer);
}

function runInterviewReview() {
  if (!interviewAnswerInput || !runInterviewButton || !prefillInterviewButton) return;

  clearTimers(interviewRunTimers);

  if (!interviewAnswerInput.value.trim()) {
    interviewAnswerInput.value = interviewReviewDemo.demoAnswer;
  }

  const answer = interviewAnswerInput.value.trim();
  runInterviewButton.disabled = true;
  prefillInterviewButton.disabled = true;
  runInterviewButton.textContent = "生成中...";

  interviewLoadingSteps.forEach((step, index) => {
    const timer = window.setTimeout(() => {
      renderInterviewPhoneLoading(step);
    }, index * 520);
    interviewRunTimers.push(timer);
  });

  const finishTimer = window.setTimeout(() => {
    renderInterviewPhoneReport(answer);
    runInterviewButton.disabled = false;
    prefillInterviewButton.disabled = false;
    runInterviewButton.textContent = "重新生成";
  }, interviewLoadingSteps.length * 520 + 360);
  interviewRunTimers.push(finishTimer);
}

if (prefillButton) {
  prefillButton.addEventListener("click", prefillDemoAnswer);
}

if (runButton) {
  runButton.addEventListener("click", runEssayReview);
}

if (prefillInterviewButton) {
  prefillInterviewButton.addEventListener("click", prefillInterviewAnswer);
}

if (runInterviewButton) {
  runInterviewButton.addEventListener("click", runInterviewReview);
}

renderInterviewPhoneIdle();
renderPhoneIdle();
