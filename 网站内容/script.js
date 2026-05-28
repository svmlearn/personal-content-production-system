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
  },
  {
    code: "ZHIWA-42",
    title: "智蛙面试 AI 教育产品",
    shortTitle: "AI Interview",
    type: "Work Experience",
    accent: "#ffe0a1",
    accent2: "#ffb9c9",
    summary:
      "从 AI 面试延展到申论备考，搭建题库、AI 批改、热点生成、逐句分析和付费转化指标体系。",
    chips: ["Essay Bank", "Dify Flow", "AI Rubric", "CVR +4.2%"],
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
  },
  {
    code: "MATRIX-26",
    title: "小红书抖音矩阵获客平台",
    shortTitle: "Matrix Growth",
    type: "Self-built Project",
    accent: "#9bd8dc",
    accent2: "#c3d9ff",
    summary:
      "围绕商家内容生产、素材库、咨询 Agent、图文视频工作台和内容队列搭建完整产品系统。",
    chips: ["Content Desk", "Agent Runtime", "Worker Queue", "Handoff"],
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
  },
];

const stage = document.querySelector("#carouselStage");
const prevButton = document.querySelector("#prevProject");
const nextButton = document.querySelector("#nextProject");
const soundToggle = document.querySelector("#soundToggle");
const bgm = document.querySelector("#bgm");

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
            <a class="project-link" href="#about" tabindex="${isActive ? "0" : "-1"}">Learn More →</a>
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

function move(delta) {
  activeIndex = (activeIndex + delta + projects.length) % projects.length;
  updateCards();
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
