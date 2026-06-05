# 2026-06-05 HTML 简历产物交接

## 当前目标

基于 `refrences/简历——洋-产品 202605 V3——FOR AI.md` 制作一份可由浏览器导出 PDF 的 HTML 简历。

用户已明确：这份 HTML 简历不需要放进个人网站应用目录；官网域名链接应放在简历第一页中。

## 已完成内容

- 新增独立 HTML 简历源文件：
  - `docs/简历/洋-AI产品经理简历-202606.html`
- 当前用户指定继续修改的副本：
  - `docs/简历/洋-AI产品经理简历-202606-agent-cover.html`
- 已将文件从误导性的 `apps/portfolio/resume.html` 位置移出。
- 当前 `apps/portfolio/resume.html` 不存在，简历未进入个人网站静态应用目录。
- 第一页保留个人评价、联系方式、官网与项目链接。
- 工作经历从第 2 页开始。
- 教育背景与证书放在最后一页。

## 2026-06-05 版面调整补充

- 用户确认 `洋-AI产品经理简历-202606-agent-cover.html` 是后续修改副本。
- 已将第一页从整页 `Harness` 海报式封面，改回简历页结构：
  - 顶部恢复姓名、角色和联系方式条。
  - 中部保留能力图，但收进独立信息 panel。
  - 底部恢复能力关键词和官网 / 项目入口。
- 去掉米黄色整页背景和大圆角整页边框，颜色回到白底、蓝色点缀、绿色辅助的简历整体风格。
- 已替换占位文案：
  - `还没想好写什么`
  - `这里写过往的项目经验，作为 RAG 被调用`
- 已将中部能力图从圆形图改成 `yang's Agent` 线条节点结构，借鉴参考图 `Work Experience` 的左侧标题、三条虚线和竖向节点排版。
- 根据浏览器批注，三条连接线已改为水平虚线，并在末端增加 `[` 形 bracket，用来框住右侧纵向节点组，进一步贴近参考图的 `Work Experience` 视觉细节。
- 因 CSS 绝对定位拼接线条在浏览器缩放和 A4 渲染中容易漂移，连接线已改为单层内联 SVG：用 3 条 `path` 统一绘制“横线 + bracket”，并移除旧的 `agent-wire / agent-bracket` 拼接元素。
- 根据 16:06 浏览器截图反馈，中部模块的视觉系统已重新收敛：
  - 去掉纯蓝卡片感和强蓝色外框。
  - 改成青绿 / 墨色 / 低饱和节点色，贴近整份 HTML 简历的底色和主色。
  - 左侧 `yang's Agent` 保持左对齐栏目标题，不再和中间节点抢视觉中心。
  - 右侧节点文字降字号和字重，减少“PPT 大标题”感。
  - 节点圆点缩小，竖线和连接线改为更轻的青绿色辅助线。
- 根据 16:17 浏览器截图反馈，第一页进一步改为参考图式“左栏标签 + 右侧条目列表”：
  - 顶部 `Y` 标识移到 Profile 模块左侧，并从右侧引出一段求职定位文案。
  - 中部 `yang's Agent` 保留轻量时间线，但去掉 SVG 复杂连线；每个节点改成左侧标签、右侧条目说明。
  - 底部移除 `Keywords` 模块，只保留 `Portfolio Links`。
- 根据 16:47 浏览器截图反馈，进一步减少横线：
  - 去掉 Profile 模块引线。
  - 去掉 `yang's Agent` 模块上下分割线。
  - 去掉每个 Agent 条目正文上方虚线。
  - 去掉 `Portfolio Links` 每行底线和该区域上方分割线。
  - 弱化 `Y` 头像框边线，减少方框感。
- 根据 17:12 浏览器截图反馈，顶部身份区进一步调整：
  - `Y` 头像移到左侧身份组，并改为圆形。
  - 姓名 `洋` 字号缩小，放到头像下方。
  - 角色说明放在姓名下方。
  - `Profile` 模块保留在右侧，减少顶部空隙。
- 根据 17:27 浏览器截图反馈，统一正文级字体：
  - 以 `Profile` 正文 `12.2px` 为基准。
  - Agent 左侧编号 `01/02/03/04` 改为 `12.2px`。
  - Agent 右侧正文、`Skill` / `RAG`、RAG 列表改为 `12.2px`。
  - `Portfolio Links` 左侧网址和右侧说明改为 `12.2px`。
  - `Plan / Harness / LLM / Tools / RAG` 左侧标签标题保留较大字号，以维持栏目层级。
- 根据 17:33 浏览器截图反馈，调整 `Tools / RAG` 内部排版：
  - 保持 Tools 区块整体高度不变。
  - `Skill` 与 `RAG` 两列改为顶部对齐，避免 `Skill` 内容被 grid 拉到中间。
  - 两列比例改为 `0.58fr / 1.42fr`，给 RAG 更多宽度。
  - RAG 列表行距略收，减少换行后的松散感。
- 根据 17:47 浏览器截图反馈，统一第一页 4 个顶层内容块之间的间距：
  - 顶层块为 `cover-top`、`contact-strip`、`harness-panel`、`cover-bottom`。
  - `.cover` 统一设置 `gap: 8mm`。
  - `contact-strip` 和 `harness-panel` 自身上下 margin 清零。
  - 移除 `cover-bottom` 的 `margin-top: auto`，避免 `Portfolio Links` 被强制推到底部。
- 根据 18:18 浏览器截图反馈，调整后续页标题和教育行：
  - `.section-title` 主标题从 `27px` 改为 `22px`，与 `.section-title small` 同字号。
  - 关闭 `.section-title::after`，去掉“工作经历 1 / 工作经历 2 / 实习经历”标题说明后面的横线。
  - 去掉 `.education-row` 的 `border-bottom`，移除教育背景两行之间 / 下方横线。
- 根据 18:30 后续讨论，调整第一页顶部定位文案：
  - 角色标签从 `AI 产品经理｜AI 产品架构｜Agent 工作流编排` 改为 `AI 产品经理｜AI 产品架构｜PMF 验证`。
  - `Profile` 从求职意向式表述改为能力交付式表述：强调业务问题拆解、LLM / RAG / Agent Workflow / AI Coding、Demo 产出、数据指标与 PMF 验证。
- 根据 19:22 浏览器打印截图反馈，新增 PDF 导出入口并补强打印样式：
  - 右上角新增 `导出 PDF` 工具栏按钮，按钮不进入打印和导出画面。
  - 前端通过 `html2canvas` + `jsPDF` 将 4 个 `.page` 分别渲染成 A4 PDF 页面并下载，绕开浏览器打印默认边距导致的背景溢出问题。
  - 补充 `print-color-adjust: exact`、打印隐藏工具栏、分页内避免断裂等 print CSS。
- 当前节点文案：
  - `01 Plan`：AI 快速产出可运行 Demo 做验证 / 北极星指标
  - `02 Harness`：产品管理 / 项目管理 / 评估 AI 产品性能
  - `03 LLM`：构建 AI 产品的技术和产品能力 / 好奇心 / Agency
  - `04 Tools / RAG`：
    - `Skill`：Codex / Claude Code / Pencil / Claude Design / 工作流沉淀
    - `RAG`：AI 学习伴侣、企业 FDE、内容获客平台、KeploreAI、智蛙面试等项目经验沉淀

## 改动文件

- `docs/简历/洋-AI产品经理简历-202606.html`
- `docs/简历/洋-AI产品经理简历-202606-agent-cover.html`
- `docs/handoff/2026-06-05-resume-html-handoff.md`

## 验证结果

- Python HTML 结构检查：通过，无未闭合标签。
- 页面标记检查：`data-page="01"` 到 `data-page="04"` 共 4 页。
- A4 打印 CSS 检查：包含 `@page`、`size: A4`、`width: 210mm`、`height: 297mm`。
- 链接检查：包含 `https://2young.xin/`、`https://learn.2young.xin/`、`https://fde.2young.xin/`、`https://xhs.2young.xin/`。
- 边界检查：`apps/portfolio/resume.html` 不存在。
- 2026-06-05 补充检查：
  - `agent-cover` 副本 HTML 结构检查通过，无未闭合标签。
  - 页面标记仍为 `data-page="01"` 到 `data-page="04"` 共 4 页。
  - A4 打印 CSS 仍包含 `@page`、`size: A4`、`width: 210mm`、`height: 297mm`。
  - 占位文案检查通过，未再出现 `这里`、`还没想好`、`TODO`、`FIXME` 等草稿标记。
  - `now Delivery` 已删除；`Memory / Knowledge` 已并入 `Tools / RAG`。
  - 16:17 补充检查：`agent-connectors` SVG 已移除，`Keywords` 页面模块已移除，`Profile` 与 4 个 `step-label` 已存在，`Portfolio Links` 保留。
  - 16:47 补充检查：Profile 引线、Agent 条目正文横线、Agent 模块上下横线、Portfolio 行线均已移除；HTML 结构检查通过。
  - 17:12 补充检查：`identity-stack` 已存在，`portrait-mark` 在 `profile-intro` 之前，头像为圆形；HTML 结构检查通过。
  - 17:27 补充检查：`profile-copy p`、`step-label span`、`step-card p`、`agent-subblock strong`、`agent-subblock li`、`site-list strong`、`site-list span` 均为 `12.2px`；HTML 结构检查通过。
  - 17:33 补充检查：`agent-rag-grid` 为 `0.58fr 1.42fr`，`agent-subblock` 为顶部对齐；HTML 结构检查通过。
  - 17:47 补充检查：`.cover` 为 `gap: 8mm`；`contact-strip` / `harness-panel` margin 为 0；`margin-top: auto` 已移除；HTML 结构检查通过。
  - 18:18 补充检查：`.section-title` 与 `.section-title small` 均为 `22px`；`.section-title::after` 已关闭；`.education-row` 已无 `border-bottom`；HTML 结构检查通过。
  - 18:30 后续补充检查：顶部角色标签与 `Profile` 文案已替换；HTML 结构检查通过。
  - 19:22 后续补充检查：`导出 PDF` 工具栏、`html2canvas`、`jsPDF` 与导出函数已存在；两条 CDN 依赖均返回 HTTP 200；HTML 结构检查通过。

备注：Codex 内置浏览器因安全策略拒绝打开本地 `file://` 页面，未做截图级视觉验证。本轮未绕过该限制。PDF 导出为前端截图式生成，优先解决视觉和分页稳定性；导出的文字通常不具备 PDF 原生文本选择能力。

## Push / Merge

- 未 commit。
- 未 push。
- 未 merge。
