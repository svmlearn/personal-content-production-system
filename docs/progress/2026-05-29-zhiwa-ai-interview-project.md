# 智蛙 AI 面试项目展示执行记录

日期：2026-05-29
分支：`work/zhiwa-ai-interview-project`
worktree：`/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/zhiwa-ai-interview-project`
实现 commit：`026f7a5b47d4aae0af277b6a8282d3a99148b7fc`
状态：实现完成，待用户验收 / 待合并决策

## 1. 问题原貌

作品集已有 `ZHIWA-42` 智蛙面试项目卡片，但只能在主站项目详情里阅读三段经历描述。用户希望它像“小红书抖音矩阵获客平台”一样，点击后进入一个独立项目展示空间。

用户特别提到：智蛙资料里有很多 Dify 工作流，想看看怎样做展示。核心风险是把项目做成 Dify YAML 或节点资料陈列，反而弱化产品经理价值。

## 2. 根因判断

当前展示弱点不是资料不够，而是信息结构太薄：

1. 主站详情只能证明“做过智蛙”，不能证明“如何把 AI 工作流产品化”。
2. Dify 工作流如果直接展示，会被误读成低代码编排能力，而不是 AI 教育产品系统能力。
3. 这段经历需要一个项目页，讲清楚从 AI 面试到申论批改、学习报告、埋点转化的系统链路。

因此本轮先做静态项目展示页，不接真实 Dify API，不复制本地归档资料。

## 3. 实际改动

新增 PRD：

- `docs/产品文档/2026-05-29-智蛙AI面试项目展示PRD.md`

修改作品集入口：

- `apps/portfolio/script.js`
  - 给 `ZHIWA-42` 的 `detail` 增加 `launch`。
  - 按现有详情页按钮体系展示“进入该项目”。
  - 入口指向 `./projects/zhiwa-ai-interview/index.html`，兼容直接打开静态 HTML。

新增智蛙项目页：

- `apps/portfolio/projects/zhiwa-ai-interview/index.html`
- `apps/portfolio/projects/zhiwa-ai-interview/styles.css`
- `apps/portfolio/projects/zhiwa-ai-interview/script.js`

页面模块：

1. 首屏：智蛙 AI 面试定位、AI 面试 / 申论批改 / Dify 工作流 / AI 教育系统关键词。
2. 产品全景：AI 面试训练、申论备考延展、AI 批改与建议、转化路径设计。
3. Dify 工作流：OCR 收卷、题型识别、评分规则、批改报告、学习建议节点切换。
4. 申论批改 Demo：归纳概括、提出对策、综合分析题型切换。
5. 增长转化：首购路径示意、埋点口径、弹窗策略、普通用户与付费用户路径差异。
6. 项目复盘：场景拆产品、老师动作拆 AI 流程、体验数据反推增长。

## 4. 审查与修复

本轮使用了 subagent：

1. `implementer`：完成入口和项目页实现。
2. `code-reviewer`：做只读两阶段审查。

code-reviewer 第一轮提出 3 个阻塞：

1. 分支 HEAD 尚未包含未跟踪文件。
2. handoff / progress 尚未写入。
3. 增长漏斗用了 `92% / 68% / 46% / 31% / 18%` 视觉比例，可能被误读成真实转化数据。

已处理：

- 将增长漏斗从精确比例条形图改为“路径示意”。
- 页面明确写入“不代表真实转化比例”。
- CSS 删除 `--bar` 比例渲染。
- 本文件和 handoff 用于解除交付记录缺口。
- 后续 commit 用于解除分支冻结缺口。

## 5. 验证证据

命令验证：

```bash
git diff --check
```

结果：通过，无输出。

```bash
node --check apps/portfolio/projects/zhiwa-ai-interview/script.js
```

结果：通过，无输出。

敏感信息检查：

```bash
rg -n 'style="--bar|[0-9]+%|/Users/wy|工作经历归档|支付数据|\.yml|\.xlsx|SECRET|TOKEN|KEY' apps/portfolio/projects/zhiwa-ai-interview apps/portfolio/script.js
```

结果：访客页面未发现本地绝对路径、归档路径、Dify YAML 文件名、支付数据、密钥或 token。命中项只包含主站既有 `+4.2%`、Keplore 既有百分比口径，以及 CSS 正常百分比宽度。

浏览器验证，file URL：

- `apps/portfolio/index.html`
  - `title`: `洋 | AI 产品作品集`
  - 点击智蛙项目后，详情标题为 `智蛙面试 AI 教育产品`
  - `launchHref`: `./projects/zhiwa-ai-interview/index.html`
  - console：none
  - 1440px 桌面宽度下无横向溢出，`scrollWidth=1440`

- `apps/portfolio/projects/zhiwa-ai-interview/index.html`
  - `title`: `智蛙 AI 面试 | AI 教育项目展示`
  - Dify 节点切换到 `批改报告与学习反馈`
  - 申论 Demo 切换到 `提出对策题`
  - 桌面 1440px：console none，overflow 0
  - 移动 390px：console none，overflow 0

浏览器验证，HTTP 静态服务器：

```bash
cd apps/portfolio
python3 -m http.server 4173 --bind 127.0.0.1
```

结果：

- `/`：`200 text/html`
- `/projects/zhiwa-ai-interview/index.html`：`200 text/html`
- 移动 390px 项目页：`批改报告与学习反馈`、`提出对策题` 可切换；`scrollWidth/windowWidth = 390/390`；console none。

截图留存：

- `/tmp/zhiwa-ai-interview-verify/main-desktop-after-fix.png`
- `/tmp/zhiwa-ai-interview-verify/project-desktop-after-fix.png`
- `/tmp/zhiwa-ai-interview-verify/project-mobile-after-fix.png`

## 6. 半成功与中断点

1. implementer 首轮长时间未落文件，Controller 打断并收窄任务，要求不再读取外部归档，只按 PRD 做静态最小可交付实现。
2. 浏览器验证第一次使用 Playwright `channel='chrome'` 脚本时无输出并被手动终止；后续改用更短脚本完成验证。
3. code-reviewer 第一轮发现增长漏斗数据化风险，已修复并复审确认该项解除。

## 7. 未覆盖范围与风险

未做：

1. 未接入真实 Dify API。
2. 未导入或运行本地归档中的 YAML 工作流。
3. 未复刻智蛙真实 App。
4. 未展示真实用户答案、支付数据或原始业务数据。
5. 未做线上部署验证。

剩余风险：

1. 项目页是静态展示，不能证明真实 Dify 链路在线可用。
2. 页面文案仍以已有资料结构和作品集既有口径为基础，未再次核对全部历史数据源。
3. 如后续要做真实 Demo，需要另开任务处理脱敏样例、API 隔离和运行成本。

## 8. 恢复路径

如需回退本轮改动：

1. 删除 `apps/portfolio/projects/zhiwa-ai-interview/`。
2. 移除 `apps/portfolio/script.js` 中 `ZHIWA-42.detail.launch`。
3. 删除本轮 PRD、progress、handoff 文档。

如需继续增强：

1. 先补一组经过脱敏和确认的真实申论批改样例。
2. 再考虑把 Dify 工作流节点从“静态说明”升级成“可播放流程图”。
3. 最后才考虑接入真实 Dify API 或后端代理。
