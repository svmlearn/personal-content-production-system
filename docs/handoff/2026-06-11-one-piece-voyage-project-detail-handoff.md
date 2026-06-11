# One Piece Voyage Portfolio - Project Detail Handoff

日期：2026-06-11

## 当前目标

继续改造 `apps/portfolio/` 首页。用户希望点击悬赏海报后先展示更完整的项目信息，再由详情层里的 CTA 进入对应项目；同时保留 One Piece 航海视觉，但减少遮挡、撕裂阴影和不必要的视觉噪音。

## Worktree / Branch

- Worktree: `/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/one-piece-voyage-portfolio`
- Branch: `codex/one-piece-voyage-portfolio`
- Base branch: 未合并回 `main`
- Push: 未 push
- Commit: 本轮准备提交，最终 hash 以 `git log -1` 为准

## 改动文件

- `apps/portfolio/index.html`
- `docs/handoff/2026-06-11-one-piece-voyage-project-detail-handoff.md`

未提交：

- `docs/DESIGNS/` 为本地参考素材目录，本轮不纳入 commit。

## 已完成内容

1. 海报点击链路调整：
   - active 悬赏海报点击后打开项目详情层。
   - hover 层 CTA 文案为 `查看详情`，点击后也打开详情层。
   - 只有详情层里的 CTA 负责进入对应项目链接。
2. 新增项目详情层：
   - 左侧展示悬赏令海报、项目编号、分类、标题、缩略图和 quick facts。
   - 右侧展示项目摘要、标签、分类型 CTA、Project Route 和 What It Shows。
   - 支持关闭、左右切换、缩略图切换，并同步外层 carousel active 项。
3. 详情层视觉：
   - 参考透明背景项目详情页，主容器改为半透明羊皮纸 / 玻璃感。
   - 左侧使用项目 accent 色半透明 tint。
   - 右侧信息区使用浅色透明背景和深色文字。
4. CTA 分类：
   - 原型类：`查看项目原型 / PROTOTYPE`
   - 内容获客平台：`进入线上系统 / LIVE APP`
   - 开源项目：`查看开源项目 / GITHUB`
   - CTA 颜色跟随项目色：智蛙 / Agent Harness 红色，AI 学习伴侣绿色，内容获客平台蓝色，FDE 蓝紫色。
5. CTA 视觉：
   - 改成厚重 8-bit 块状阴影按钮。
   - hover / active 增加物理下压感。
   - 去掉斜向高光。
6. 项目文案调整：
   - AI 学习伴侣去掉互动游戏、声音克隆、口吻模拟表述。
   - 改为上下文工程、Skill、长期记忆、AI 产品测试与优化。
   - 智蛙 AI 面试改为“从 AI 面试延展到申论批改、热点题库和逐句分析。构建数据指标体系，提升付费率4.2%。”
   - 付费相关指标文案已统一为 `付费率` / `付费指标`。
   - 申论批改模块改为“调研和拆解专业老师真实批改习惯，设计 AI 工作流。”
   - `热点与逐句分析` 模块替换为 `内部工作流程 AI 改造`，只保留用户给出的题库生产、运营内容平台、openclaw 进度追踪事实。
7. 海报 hover 浮层：
   - 保留鼠标停上去才显示信息的交互。
   - 删除右侧撕裂暗面。
   - 删除斜向条纹和红黑阴影感。
   - 改为干净的深色半透明覆盖层。

## 验证结果

本轮使用本地服务和 `web-access` CDP Proxy 验证：

- 本地服务：`http://127.0.0.1:8097/`
- JavaScript 解析：`scripts parse ok: 2`
- 错误付费指标文案：未检出残留。
- 非当前分类规则的旧 CTA 文案：未检出残留。
- 详情层 CTA 文案验证：
  - 智蛙 AI 面试：`查看项目原型 / PROTOTYPE`
  - AI 学习伴侣：`查看项目原型 / PROTOTYPE`
  - 内容获客平台：`进入线上系统 / LIVE APP`
  - FDE 企业 AI：`查看项目原型 / PROTOTYPE`
  - Agent Harness：`查看开源项目 / GITHUB`
- 五个 CTA 均无横向溢出。
- hover 浮层 CSS：
  - 无撕裂裁切规则
  - 无伪元素斜纹层
  - 无 105 度斜纹渐变
  - 无红色径向阴影渐变

## 剩余风险

1. 移动端详情层没有做完整人工验收，本轮主要验证桌面宽屏。
2. 海报图片仍引用远程 `lh3.googleusercontent.com/aida-public/...` 资源，正式部署前建议本地化。
3. Tailwind 仍通过 CDN 加载，正式生产化可再收口。

## 下一步建议

1. 用户在本地服务验收 hover 海报、详情层、CTA 分类和项目文案。
2. 验收后再决定是否 push、开 PR 或合并回 `main`。
