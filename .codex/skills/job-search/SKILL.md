---
name: job-search
description: Use when helping the user find, evaluate, organize, or apply to AI product manager jobs, especially BOSS 直聘岗位采集、飞书多维表格岗位池维护、JD匹配判断、投递意愿标注、岗位筛选经验沉淀、以及后续批量筛岗/投递策略制定。
---

# Job Search

Use this skill as the reusable workflow for the user's AI 产品经理找工作 process.

## Core Principle

Optimize for fit, not company fame or title keywords. The target is not generic "AI 产品经理"; it is AI application / AI Agent / AI Native tool product work that can be credibly connected to the user's portfolio: content marketing system, Agent projects, independent prototyping, end-to-end delivery, product sense, and deep AI tool usage.

Read [preference-profile.md](references/preference-profile.md) before making nontrivial screening judgments or assigning `投递意愿`.

Read [search-strategy.md](references/search-strategy.md) before starting a new BOSS search batch or delegating search to subagents.

## Tools

1. Use `web-access` for BOSS, Feishu web, and any login-dependent site.
2. Prefer `/opt/homebrew/bin/lark-cli` for Feishu Base reads/writes when user authorization is available.
3. If `lark-cli doctor` shows user identity missing or scopes insufficient, ask for/perform Feishu authorization before writing. Bot identity may read but often cannot mutate user-owned Base docs.
4. Preserve exact BOSS detail links. Do not infer missing company facts when BOSS hides them.

## Browser Discipline

When collecting BOSS details in Chrome, keep open tabs under control. Open detail pages in small batches, usually 3-5 at a time; after extracting JD, company facts, benefits, address, and links, persist the data locally or to Feishu and close those tabs before opening the next batch. Do not leave many completed BOSS tabs open because Chrome memory usage grows quickly during this workflow.

## Feishu Table Contract

Use the existing job pool unless the user asks for a new one:

- Wiki: `https://my.feishu.cn/wiki/Fd5ow8skXiryp4kdQcScra0wnBg`
- Base token: `BzxLbGP1TaUDIcs7RKec7bwIn9b`
- Table: `岗位池` / `tbl2J8PrdS7lRuuq`
- View: `表格` / `vew7iquz00`

Expected core fields:

- `序号`
- `采集日期`
- `初判状态`
- `用户反馈`
- `投递意愿`
- `岗位名称`
- `公司名称`
- `薪资`
- `城市`
- `经验`
- `学历`
- `列表标签`
- `福利待遇`
- `融资阶段`
- `公司人数`
- `公司行业`
- `公司业务简介`
- `工商公司名`
- `注册资本`
- `成立日期`
- `企业类型`
- `经营状态`
- `公司具体地点`
- `JD`
- `招聘者`
- `职位链接`
- `公司链接`

When adding fields, use `lark-cli base +field-create --as user`. When updating per-row values, use `lark-cli base +record-upsert --record-id ... --as user`.

## Screening Workflow

1. Read current Feishu rows first.
2. Preserve the user's `用户反馈`; treat it as the strongest preference signal.
3. Use the current search strategy to build a broad list-level pool first; do not rely only on BOSS recommendations.
4. For new BOSS jobs selected for Feishu, open each detail page and collect job detail link, JD, company size, company business, registered capital, benefits, and exact work address.
5. Assign `投递意愿` conservatively from the preference profile and user feedback.
6. Keep `无 / 低 / 中 / 高` separate from commentary:
   - `无`: do not spend meaningful time unless user overrides.
   - `低`: can apply casually or keep as backup; do not customize heavily.
   - `中`: worth applying and light research.
   - `高`: worth tailoring resume/project pitch.
7. Write the AI's screening rationale, caveats, and uncertainty into `初判状态`, preferably prefixed with the assigned `投递意愿` such as `中：...`.
8. Do not write AI-generated screening notes into `用户反馈`. That column is reserved for the user's own later judgment and corrections.

## Feishu Column Ownership

- `初判状态`: AI-written screening rationale from this skill, including fit reasoning, downgrade reasons, uncertainty, and caveats.
- `投递意愿`: AI-assigned select value `无 / 低 / 中 / 高`, derived from the preference profile and any existing user feedback.
- `用户反馈`: user-owned column only. Preserve existing values exactly. Leave it empty for newly collected jobs unless the user explicitly tells you what feedback to write there.
- `打招呼术语`: AI-written, recruiter-facing copy that the user can send directly. It should be truthful, concise, and tailored to the JD.

## Greeting Copy Rules

`打招呼术语` is recruiter-facing copy the user may paste directly into BOSS. It is not a screening note. Write it like a normal person introducing their fit, not like a keyword list.

### Greeting Workflow

1. Read the JD, `岗位名称`, `列表标签`, `投递意愿`, `初判状态`, and any existing user feedback.
2. Choose one primary matching story. Do not cram every project into one message.
3. Separate evidence types before writing:
   - `公开作品集可见`: can be introduced through `这是我的作品集网站，有...`.
   - `简历/真实经历`: phrase as `我做过...`, `我负责过...`, or `我在项目里...`.
   - `内部术语/招聘方不懂的名字`: translate into business scenario and capability.
   - `不确定`: do not write to Feishu yet; list for the user to confirm.
4. Draft a paragraph of roughly 120-220 Chinese characters. The first ~20 characters should work as an IM preview hook, but the full message must still read naturally.
5. Before writing, run a mental banned-phrase check and a truthfulness check.

### Opening Style

Use natural personal-site phrasing:

- `这是我的作品集网站，有AI内容营销系统：https://2young.xin/`
- `这是我的作品集网站，有Agent产品经历：https://2young.xin/`
- `这是我的作品集网站，有AI教育项目：https://2young.xin/`
- `这是我的作品集网站，有AI工具实践：https://2young.xin/`

Do not use awkward labels such as `Agent作品集`, `AI营销作品集`, `AI Coding作品集`, `门店AI作品集`, `AI应用作品集`, or `作品集在这`.

Avoid generic `里面放了...` claims. Only say something is on the website if it is actually visible on the public portfolio. For confirmed experience that is not necessarily visible on the site, use `我做过...` or `我在项目里...`.

### Matching Stories

- `AI 教育 / 学习产品`: mention 智蛙面试 and/or AI 学习伴侣. For 智蛙, emphasize user interviews, professional teacher interviews, extracting the teacher's essay-grading process into an AI workflow, data metrics, good case / bad case, and turning the Dify build-test-optimize evaluation loop into a skill. For AI 学习伴侣, emphasize productizing paid-community teacher services: business consulting, career planning, daily companionship, context engineering, intent recognition, memory module, and Agent performance testing.
- `AI 营销 / AIGC / 内容 / 电商增长`: emphasize AI marketing, 0-to-1 marketing Agent, Agent product design, context engineering, tool calling, intent recognition, permission control, product prototyping, and customer/requirements discovery. Do not default to `AI 剪辑`; use it only when the JD clearly needs video production workflow.
- `AI Agent / workflow / AI Native`: combine AI 内容营销系统 and KeploreAI when relevant. KeploreAI must be explained as work on an Agent product for AI algorithm engineers' project reproduction/deployment scenarios; do not write `KeploreAI Agent` without explanation.
- `AI coding / developer tool / IDE / Copilot`: mention Codex / Claude Code, `Harness Engineering`, skill creation, sub-agent collaboration, tool-call order, and acceptance workflows. Do not write `Codex Agent Harness` as a standalone black-box project name.
- `RAG / knowledge base / Copilot / enterprise workflow`: emphasize AI 学习伴侣, context engineering, memory, intent recognition, tool calling, Agent evaluation, and workflow/productization. Use KeploreAI only if the JD cares about Agent product or technical workflow.
- `Retail / store operations / business process AI`: use AI 内容营销系统 as evidence for turning business actions into Agent workflows, permissions, task flow, and measurable product process. Do not pretend there is a `门店AI` project.
- `Finance / data / governance-heavy`: keep the greeting conservative. Emphasize business systems, data analysis, Agent/AI product prototypes, workflow/productization, and metrics. Do not overclaim finance expertise.
- `Hardware / IoT / audio`: do not use ToB directional-audio, scan-to-use, or content-management internship details by default, including hardware roles, unless the user explicitly asks. Usually keep these roles low-effort or avoid applying.

### Banned Or Risky Phrases

Do not write these into `打招呼术语`:

- `里面放了...` as a generic claim.
- `KeploreAI Agent`.
- `Codex Agent Harness` as a standalone unexplained phrase.
- `ToB 定向音响 MVP`, `扫码用机`, `线上内容管理`.
- `AI 剪辑` by default, unless the JD is clearly about video production workflow.
- Any phrase that says or implies the user has strong vertical expertise they does not have, such as deep finance, medical, hardware mass-production, voice/audio, or algorithm training expertise.

Mismatch caveats belong in `初判状态`, not in the recruiter-facing greeting.

## Strong Fit Signals

Prefer jobs where the JD emphasizes:

- AI Native product design.
- AI Agent / workflow / tool product.
- LLM application, SaaS/PaaS, developer platform, knowledge base, automation, or productivity tools.
- 0-to-1 product work, prototyping, PRD, user feedback, data-driven iteration.
- Claude Code / Codex / Cursor / Vibe coding / independent delivery as product strengths.
- Content marketing, ecommerce growth, AI marketing, creator tools, or platform/tooling domains that connect to the user's projects.

## Fast Reject Or Downgrade Signals

Downgrade hard when the JD is primarily:

- Hardware-bound: smart lights, wearables, audio devices, consumer electronics, IoT, furniture/home unless the software Agent layer is dominant.
- Algorithm/engineering-heavy: PyTorch/TensorFlow, model training, RAG/GraphRAG implementation, data pipelines, Python engineering as core responsibility.
- Deep vertical expertise the user lacks: voice/audio AI, data governance, GEO, community search, hardware mass production, overseas localization when it is a hard requirement.
- Very early or unclear business: tiny company, newly founded, vague AI exploration, no clear product traction.
- Anonymous headhunter with missing company, address, benefits, and business information.

## Output

When reporting back:

- Summarize high-signal changes, not every raw field.
- Mention exact Feishu table/view updated.
- Call out rows with missing facts, especially anonymous jobs.
- State confidence when making preference inferences from user feedback.
