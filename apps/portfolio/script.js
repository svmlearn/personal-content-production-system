const projects = [
  {
    code: "KEPLORE-21",
    title: "KeploreAI PMF 增长验证",
    shortTitle: "PMF Growth",
    type: "Work Experience",
    accent: "#cce49f",
    accent2: "#fff1a8",
    summary:
      "面向 AI 算法工程师的 Agent 产品，从访谈、内测和行为路径里定义 Aha Moment，再把增长机制挂到激活行为上。",
    chips: ["Aha Moment", "User Interview", "Activation +60%", "Open Chat"],
    detail: {
      theme: "keplore",
      kicker: "AI Agent / Developer Workflow",
      intro:
        "KeploreAI 解决的是 AI 算法工程师复现项目时最浪费时间的一段：环境配置、依赖冲突、启动失败和成果无法沉淀。我的工作不是把它包装成一个“能聊天的工具”，而是从用户真正愿意付费的瞬间反推产品链路。",
      proof: ["3 轮对话内一键部署", "激活型邀请裂变 +60%", "首次有效操作 +40%", "PR / 下载 / 分享闭环"],
      flow: ["项目意图输入", "Agent 诊断仓库", "环境部署", "运行验证", "成果沉淀"],
      sections: [
        {
          title: "产品判断",
          body:
            "用户并不是为了“多一个 AI 助手”付费，而是为了更快把一个陌生项目跑起来。通过内测群运营和深度访谈，我把付费驱动因素定义为：用户在 3 轮对话内成功将自己的项目一键部署。",
        },
        {
          title: "核心体验",
          body:
            "首页从单一 GitHub 链接输入框改为开放式 AI 对话入口，承接“我不知道从哪开始”的冷启动问题；同时加入动态灵感用例，用户点击即可填入高质量 Prompt，把抽象能力变成具体动作。",
        },
        {
          title: "增长与沉淀",
          body:
            "邀请机制不奖励注册，而是奖励“成功启动项目”的激活行为，并用社交督促看板提升新用户完成率。产出侧规划一键提交 PR 到 GitHub、批量下载和公开链接分享，形成部署、开发、沉淀的完整闭环。",
        },
      ],
    },
  },
  {
    code: "ZHIWA-42",
    title: "智蛙面试 AI 教育产品",
    shortTitle: "AI Interview",
    type: "Work Experience",
    accent: "#b8f4d3",
    accent2: "#8be8d9",
    summary:
      "从 AI 面试延展到申论备考，搭建题库、AI 批改、热点生成、逐句分析和付费转化指标体系。",
    chips: ["Essay Bank", "Dify Flow", "AI Rubric", "CVR +4.2%"],
    detail: {
      theme: "zhiwa",
      kicker: "AI Education / Interview Training",
      intro:
        "智蛙面试面向考公、事业单位、教资教编、医疗编等面试备考场景，外部产品主视觉是绿色系，核心心智是 AI 面试专家、仿真模拟、五维评分和专业报告。我的工作重点是把原本生命周期较短的 AI 面试，向更长的考公备考链路延展。",
      proof: ["五维能力评分", "仿真模拟面试", "申论 AI 批改", "付费转化率 +4.2%"],
      flow: ["题库建设", "AI 批改", "热点练习", "面试报告", "转化路径"],
      launch: {
        label: "进入该项目",
        href: "./projects/zhiwa-ai-interview/index.html",
        note: "静态项目展示页",
      },
      sections: [
        {
          title: "申论模块从 0 到 1",
          body:
            "围绕行测、申论、面试的备考链路，新增申论模块以延展用户生命周期。我负责竞品调研、内容定义、题库搭建、Dify 工作流编排、答案审核和自然语言审批建议等完整流程。",
        },
        {
          title: "AI 批改体验",
          body:
            "通过调研老师真实批改习惯，把标注、打勾、评分、评语风格拆成可执行的 AI 编排流程，产出模拟老师笔迹和结构化报告的产品方案，提升用户对“被认真批改”的感知价值。",
        },
        {
          title: "面试与数据体系",
          body:
            "在面试模块加入热点生成和逐句分析，让练习不只是录音和打分。数据侧补齐从进入页面、体验功能、到达付费页到最终下单的全链路指标，用付费用户与普通用户路径差异指导注册流程和弹窗策略。",
        },
      ],
    },
  },
  {
    code: "LEARN-AI",
    title: "AI 智能学习伴侣",
    shortTitle: "Learning Agent",
    type: "Self-built Project",
    accent: "#ffcad7",
    accent2: "#b4ddff",
    summary:
      "把社群老师能力拆成 Agent、记忆、语音和互动游戏，做商业咨询、职业规划和长期陪伴体验。",
    chips: ["Memory", "Voice Clone", "Skill Pack", "Daily Loop"],
    detail: {
      theme: "learning",
      kicker: "Multi-Agent / Companion Product",
      intro:
        "AI 智能学习伴侣是给付费社群学员提供增值服务的个人项目。它的核心不是“做一个聊天机器人”，而是把老师在社群里的服务拆成可复用的 Agent 能力、长期记忆、语音陪伴和高频互动入口。",
      proof: ["商业咨询 Skill", "职业规划长期记忆", "声音克隆", "互动游戏引擎"],
      flow: ["用户画像", "Skill 路由", "工具调用", "长期记忆", "日常陪伴"],
      launch: {
        label: "进入该项目",
        domain: "learn.2young.xin",
        port: 3003,
        path: "/",
        note: "线上项目：learn.2young.xin",
      },
      sections: [
        {
          title: "商业咨询与职业规划",
          body:
            "商业咨询 Agent 配置 ROI、LTV/CAC 等计算工具和分析框架；职业规划侧在对话中抽取称呼、行业、职业、发展经历等多维信息并永久化存储，让每次建议都贴合用户个人处境。",
        },
        {
          title: "情感陪伴",
          body:
            "通过声音克隆和 TTS 语速调校，让语音听感更自然、温暖。Prompt 与 RAG 尽量保留课程逐字稿中的口吻、语气词和表达习惯，使陪伴体验更像熟悉的老师，而不是模板客服。",
        },
        {
          title: "高频互动",
          body:
            "玄学功能被明确定位为“电子木鱼”式趣味互动，而不是严肃占卜。骰子外观、摇一摇、音效和彩蛋都来自社群文化，用轻量娱乐承接日活和心理疗愈需求。",
        },
      ],
    },
  },
  {
    code: "MATRIX-26",
    title: "小红书抖音矩阵获客平台",
    shortTitle: "Matrix Growth",
    type: "Self-built Project",
    accent: "#9bd8dc",
    accent2: "#f6aac8",
    summary:
      "围绕商家内容生产、素材库、咨询 Agent、图文视频工作台和内容队列搭建完整产品系统。",
    chips: ["Content Desk", "Agent Runtime", "Worker Queue", "Handoff"],
    detail: {
      theme: "matrix",
      kicker: "AI Marketing / Content Operating System",
      intro:
        "这是一个面向商家的 AI 营销内容生产系统。它不是单纯的“发小红书工具”，而是从品牌定位、爆款内容检索、营销日历，到图文生成和视频任务执行的内容作战台。",
      proof: ["咨询 Agent", "策略快照", "营销内容日历", "图文 / 视频工作台", "素材切分与标签"],
      flow: ["商家资料", "知识库与素材检索", "AI 咨询诊断", "营销日历", "图文与视频生产"],
      launch: {
        label: "进入该项目",
        domain: "xhs.2young.xin",
        port: 3001,
        path: "/login?demo=1&next=%2Fdashboard",
        note: "线上平台：xhs.2young.xin",
      },
      sections: [
        {
          title: "咨询 Agent 平台",
          body:
            "咨询层调用商家资料、用户知识库、上传的视频图片素材、社媒爆款内容和平台方法论，在交互中帮助用户完成品牌产品定位、卖点提炼、受众场景拆解，并输出一周营销内容日历。",
        },
        {
          title: "图文内容工作台",
          body:
            "内容日历不是静态表格，而是下游生产入口。用户点击日历卡片后进入图文工作台，带入策略快照、选中的日历主题、素材上下文和生成模式，产出草稿、AI 修改版本和内容变体。",
        },
        {
          title: "视频脚本与 AI 剪辑",
          body:
            "视频链路从营销日历生成脚本，再结合用户素材进入视频任务。素材中心把原始资产切成可检索、可编辑、可下载的 clip，并通过角色、镜头、场景等标签供 worker 使用；后续可接声音克隆、口型变换和 AI 视频剪辑。",
        },
      ],
    },
  },
  {
    code: "FDE-01",
    title: "FDE 企业 AI 赋能",
    shortTitle: "FDE",
    type: "Enterprise AI Project",
    accent: "#91d8ff",
    accent2: "#9ef0c5",
    summary:
      "面向企业的大模型转型范式集合，把销售、客服、知识库、会议、BI、质检和流程 Agent 做成可体验样例。",
    chips: ["ToB LLM", "Agent Demo", "Prompt Library", "AI Enablement"],
    detail: {
      theme: "fde",
      kicker: "Enterprise AI / Enablement Playbook",
      intro:
        "FDE 企业 AI 赋能是面向 ToB 场景的大模型范式集合。它不是单个聊天助手，而是一组可被企业拿去理解、演示和改造的 AI 工作流样例，用来帮助业务团队把抽象的大模型能力落到具体岗位、流程和数据场景里。",
      proof: ["完整项目已纳入 apps/fde-ai-empowerment", "销售 / 客服 / BI / 会议等范式", "Demo + Prompt 双入口", "企业 AI 转型样例库"],
      flow: ["场景识别", "范式选择", "Prompt 复制", "Demo 体验", "企业改造"],
      launch: {
        label: "进入该项目",
        domain: "fde.2young.xin",
        port: 3004,
        path: "/",
        note: "线上项目：fde.2young.xin",
      },
      sections: [
        {
          title: "项目定位",
          body:
            "这个项目先作为企业 AI 赋能的范式库入口，展示不同部门如何把大模型能力嵌入到现有工作流里。后续可以把它扩展成面向客户演示、售前咨询和内部培训的统一 FDE 工作台。",
        },
        {
          title: "体验方式",
          body:
            "每个范式保留原项目的 Demo 与 Prompt 面板，让用户既能看到交互效果，也能拿到可复制的提示词结构。当前先完整迁入原仓库内容，不拆、不重写、不抽象成静态介绍页。",
        },
        {
          title: "企业价值",
          body:
            "FDE 的重点是让企业从“想用 AI”走到“知道哪个岗位、哪个流程、哪种数据适合先做”。它可以承接客户调研、场景共创、AI 培训和行业方案沉淀。",
        },
      ],
    },
  },
  {
    code: "HARNESS-04",
    title: "Harness Engineering 理解",
    shortTitle: "Harness System",
    type: "System Project",
    accent: "#d7c0f2",
    accent2: "#9ed5bf",
    summary:
      "把 Vibe Coding 推到可靠交付：需求、设计、开发、审查、修复、验证和经验沉淀组成闭环。",
    chips: ["8 Skills", "6 Hooks", "Review Loop", "Steering"],
    detail: {
      theme: "harness",
      kicker: "Agent Harness / Product Engineering",
      intro:
        "Harness Engineering 不是继续优化提示词，而是给 Agent 搭一套产品开发系统。模型负责智能，Harness 负责约束、引导、检查和进化，让 AI 从“会写代码”变成“能稳定推进产品交付”。",
      proof: ["Guides: 8 Skills", "Sensors: 6 Hooks", "两阶段 Code Review", "Context Firewall", "Steering Loop"],
      flow: ["想法", "Product Spec", "Design Brief", "DEV Plan", "Build", "Review / Fix", "Release"],
      sections: [
        {
          title: "前馈控制",
          body:
            "八个 Skill 作为 Guides，在 Agent 动手前注入方法论和验收标准：需求收集、设计规范、设计图、开发计划、编码实现、系统调试、代码审查和发布构建。它解决的是“AI 开始做之前是否知道该怎么做”。",
        },
        {
          title: "反馈控制",
          body:
            "六个 Hook 加两阶段 Code Review 作为 Sensors，在行动后检查偏差：编译不过阻止提交、代码改动标记待审查、停止前检查 review 状态，功能合规和代码质量分阶段审查，不把“感觉完成了”当完成。",
        },
        {
          title: "持续进化",
          body:
            "Sub-Agent 用 fresh 实例隔离上下文，避免错误假设跨任务传播；反馈系统把反复出现的用户修正沉淀为规则建议。真正的目标不是一次性自动化，而是让系统越用越少犯同类错误。",
        },
      ],
    },
  },
];

const stage = document.querySelector("#carouselStage");
const prevButton = document.querySelector("#prevProject");
const nextButton = document.querySelector("#nextProject");
const soundToggle = document.querySelector("#soundToggle");
const bgm = document.querySelector("#bgm");
const detailSection = document.querySelector("#project-detail");
const detailKicker = document.querySelector("#detailKicker");
const detailTitle = document.querySelector("#detailTitle");
const detailCode = document.querySelector("#detailCode");
const detailIntro = document.querySelector("#detailIntro");
const detailProof = document.querySelector("#detailProof");
const detailActions = document.querySelector("#detailActions");
const detailFlow = document.querySelector("#detailFlow");
const detailSections = document.querySelector("#detailSections");
const detailSwitches = document.querySelector("#detailSwitches");

let activeIndex = 0;
let dragStartX = null;
let wheelLocked = false;

function signedOffset(index) {
  const total = projects.length;
  let offset = index - activeIndex;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

function cardPosition(offset) {
  const abs = Math.abs(offset);
  const side = Math.sign(offset);
  const mobile = window.matchMedia("(max-width: 700px)").matches;

  if (abs === 0) {
    return { x: 0, y: 0, rot: 0, scale: 1, opacity: 1, z: 10 };
  }

  const step = mobile ? 250 : 416;
  const curve = mobile ? 34 : 55;
  const x = side * (step * abs + Math.max(0, abs - 1) * (mobile ? 36 : 18));
  const y = curve * abs * abs + (abs === 1 ? 5 : 0);
  const rot = side * (abs === 1 ? 4 : abs === 2 ? 8 : 12);
  const scale = abs === 1 ? 1.065 : abs === 2 ? 1.16 : 1.22;
  const opacity = abs > 2 ? 0 : 1;
  const z = 10 - abs;

  return { x, y, rot, scale, opacity, z };
}

function renderCards() {
  stage.innerHTML = projects
    .map((project, index) => {
      const isActive = index === activeIndex;
      return `
        <article
          class="project-card${isActive ? " is-active" : ""}"
          data-index="${index}"
          aria-hidden="${isActive ? "false" : "true"}"
          style="--accent: ${project.accent}; --accent-2: ${project.accent2};"
        >
          <div class="project-visual" aria-hidden="true">
            <span class="visual-title">${project.shortTitle}</span>
            ${project.chips
              .map((chip, chipIndex) => `<span class="chip chip-${["one", "two", "three", "four"][chipIndex]}">${chip}</span>`)
              .join("")}
          </div>
          <div class="project-copy">
            <small>${project.type} / ${project.code}</small>
            <h2>${project.title}</h2>
            <p>${project.summary}</p>
            <a class="project-link" href="#project-detail" data-detail-index="${index}" tabindex="${isActive ? "0" : "-1"}" aria-label="查看${project.title}详情">Learn More →</a>
          </div>
        </article>
      `;
    })
    .join("");
  updateCards();
}

function updateCards() {
  [...stage.querySelectorAll(".project-card")].forEach((card) => {
    const index = Number(card.dataset.index);
    const offset = signedOffset(index);
    const pos = cardPosition(offset);
    card.style.setProperty("--tx", `${pos.x}px`);
    card.style.setProperty("--ty", `${pos.y}px`);
    card.style.setProperty("--rot", `${pos.rot}deg`);
    card.style.setProperty("--scale", pos.scale);
    card.style.setProperty("--opacity", pos.opacity);
    card.style.setProperty("--z", pos.z);
    card.classList.toggle("is-active", offset === 0);
    card.setAttribute("aria-hidden", String(offset !== 0));
    const link = card.querySelector(".project-link");
    if (link) link.tabIndex = offset === 0 ? 0 : -1;
  });
}

function renderDetailSwitches() {
  detailSwitches.innerHTML = projects
    .map(
      (project, index) => `
        <button class="detail-switch${index === activeIndex ? " is-active" : ""}" type="button" data-detail-index="${index}">
          <span>${project.shortTitle}</span>
        </button>
      `,
    )
    .join("");
}

function renderDetail(scrollIntoView = false) {
  const project = projects[activeIndex];
  const detail = project.detail;

  detailSection.dataset.theme = detail.theme;
  detailKicker.textContent = detail.kicker;
  detailTitle.textContent = project.title;
  detailCode.textContent = `${project.type} / ${project.code}`;
  detailIntro.textContent = detail.intro;
  detailProof.innerHTML = detail.proof.map((item) => `<span>${item}</span>`).join("");
  const launchHref = detail.launch ? resolveLaunchHref(detail.launch) : "";
  detailActions.hidden = !detail.launch;
  detailActions.innerHTML = detail.launch
    ? `
      <a class="detail-launch" href="${launchHref}" target="_blank" rel="noreferrer" aria-label="${detail.launch.label}：${project.title}">
        <span>${detail.launch.label}</span>
        <strong aria-hidden="true">↗</strong>
      </a>
      <small>${detail.launch.note}</small>
    `
    : "";
  detailFlow.innerHTML = detail.flow.map((item, index) => `<span data-step="${String(index + 1).padStart(2, "0")}">${item}</span>`).join("");
  detailSections.innerHTML = detail.sections
    .map(
      (section, index) => `
        <article class="detail-block">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <h3>${section.title}</h3>
          <p>${section.body}</p>
        </article>
      `,
    )
    .join("");
  renderDetailSwitches();

  if (scrollIntoView) {
    detailSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function resolveLaunchHref(launch) {
  if (launch.href) return launch.href;
  const currentHost = window.location.hostname || "127.0.0.1";
  const isLocalHost = currentHost === "127.0.0.1" || currentHost === "localhost";
  const host = currentHost === "127.0.0.1" ? "localhost" : currentHost;
  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  if (launch.domain && !isLocalHost) {
    return `${protocol}//${launch.domain}${launch.path || "/"}`;
  }
  return `${protocol}//${host}:${launch.port}${launch.path || "/"}`;
}

function move(delta) {
  activeIndex = (activeIndex + delta + projects.length) % projects.length;
  updateCards();
  renderDetail(false);
}

prevButton.addEventListener("click", () => move(-1));
nextButton.addEventListener("click", () => move(1));

stage.addEventListener("pointerdown", (event) => {
  dragStartX = event.clientX;
  stage.setPointerCapture?.(event.pointerId);
});

stage.addEventListener("pointerup", (event) => {
  if (dragStartX === null) return;
  const diff = event.clientX - dragStartX;
  dragStartX = null;
  if (Math.abs(diff) < 42) return;
  move(diff > 0 ? -1 : 1);
});

stage.addEventListener("click", (event) => {
  const link = event.target.closest(".project-link");
  if (link) {
    event.preventDefault();
    const index = Number(link.dataset.detailIndex);
    if (Number.isInteger(index)) {
      activeIndex = index;
      updateCards();
      renderDetail(true);
    }
    return;
  }

  const hitElement = document.elementFromPoint(event.clientX, event.clientY);
  const card = event.target.closest(".project-card.is-active") || hitElement?.closest(".project-card.is-active");
  if (card) {
    renderDetail(true);
  }
});

detailSwitches.addEventListener("click", (event) => {
  const button = event.target.closest(".detail-switch");
  if (!button) return;
  const index = Number(button.dataset.detailIndex);
  if (!Number.isInteger(index)) return;
  activeIndex = index;
  updateCards();
  renderDetail(false);
});

stage.addEventListener(
  "wheel",
  (event) => {
    if (Math.abs(event.deltaX) < 12 && Math.abs(event.deltaY) < 16) return;
    event.preventDefault();
    if (wheelLocked) return;
    wheelLocked = true;
    move(event.deltaX + event.deltaY > 0 ? 1 : -1);
    window.setTimeout(() => {
      wheelLocked = false;
    }, 520);
  },
  { passive: false },
);

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") move(-1);
  if (event.key === "ArrowRight") move(1);
});

window.addEventListener("resize", updateCards);

soundToggle.addEventListener("click", async () => {
  const enabled = soundToggle.getAttribute("aria-pressed") !== "true";
  soundToggle.setAttribute("aria-pressed", String(enabled));
  soundToggle.textContent = enabled ? "BGM ON" : "BGM OFF";
  if (!bgm) return;
  bgm.volume = 0.42;
  if (enabled) {
    try {
      await bgm.play();
    } catch {
      soundToggle.setAttribute("aria-pressed", "false");
      soundToggle.textContent = "BGM OFF";
    }
  } else {
    bgm.pause();
  }
});

renderCards();
renderDetail(false);
