# 2026-05-29 Content Platform Light Workspaces

## 问题原貌

`/dashboard/consultation` 已经在上一轮恢复为浅色工作台，但登录后其它用户侧页面仍保留旧黑金后台视觉：

- `/dashboard/article`：图文工作台左侧输入区、结果卡片仍是黑底白字、金色操作。
- `/dashboard/video`：视频脚本室对话区、脚本画布、配音面板仍是黑底白字、金色按钮。
- `/dashboard/content`：社媒爆款内容库列表、详情、弹窗仍是黑色侧栏和黑色卡片。
- `/dashboard/history`：我的内容列表和详情仍是黑色侧栏与黑卡。
- `/dashboard/settings`：用户信息页和内嵌知识库仍是黑色表单和旧金色按钮。
- `/dashboard/team`、`/dashboard` 今日任务：仍有旧黑金组件残留。

用户反馈重点是黑色面板和粉白浅色外壳混在一起很突兀，需要统一到当前 `DashboardShell` 与团队选题页的浅色工作台风格。

## 实现边界

本轮只做视觉/UI token 收敛，没有修改：

- auth、路由语义、表单提交逻辑、fetch/API 调用。
- 数据库、server-db、lib/db、worker、脚本、对象存储。
- `package.json`、lockfile、依赖。
- ignored `refrences/` / `references/` 参考副本。

## 受影响页面

已覆盖：

- `/dashboard/article`
- `/dashboard/video`
- `/dashboard/content`
- `/dashboard/history`
- `/dashboard/settings`
- `/dashboard/team`
- `/dashboard` 今日任务工作台
- 设置页内嵌的用户知识库 / 项目媒体素材区

## 实际改动

修改文件：

- `apps/content-growth-platform/src/components/merchant/article-workbench.tsx`
- `apps/content-growth-platform/src/components/merchant/video-workbench.tsx`
- `apps/content-growth-platform/src/components/merchant/content-center.tsx`
- `apps/content-growth-platform/src/components/merchant/daily-tasks-workspace.tsx`
- `apps/content-growth-platform/src/components/merchant/history-hub.tsx`
- `apps/content-growth-platform/src/components/merchant/settings-workspace.tsx`
- `apps/content-growth-platform/src/components/merchant/team-management-workspace.tsx`
- `apps/content-growth-platform/src/components/merchant/merchant-knowledge-library.tsx`

主要处理：

1. 将旧黑色背景替换为浅色工作台容器：
   - `#fffaf6`、`#fffaf7`、`white`
2. 将旧白色透明边框替换为暖灰边框：
   - `#eadfd7`
3. 将正文从白字透明度体系替换为深色可读文本：
   - `#1f2328`、`#4f433d`、`#6f625d`、`#8b7b72`、`#9b8d84`
4. 将旧金色主操作替换为当前浅色工作台主色：
   - 主操作：`#f2556b` / hover `#e94b73`
   - 成功状态：`#22b8a7` / `#0f766e`
   - 轻量提醒/标签：`#fff7ed` / `#c46a00`
5. 同步浅化：
   - 图文工作台侧栏、策略卡、标题方案、正文预览、修改区、空状态。
   - 视频工作台对话区、输入区、脚本画布、配音设置、进度模块、上传格。
   - 社媒爆款内容库列表、详情、媒体预览、解析/找爆款弹窗。
   - 我的内容列表与历史详情。
   - 用户信息表单、团队成员页、用户知识库和项目媒体素材区。
6. 浏览器截图发现 390px 移动宽度下部分页面仍沿用桌面横排布局：
   - 图文工作台头部按钮挤压。
   - 视频脚本室头部按钮和画布区域挤压。
   - 用户信息页左侧 tab 与表单并排，导致表单内容被压窄。
   - 我的内容、团队成员的侧栏 / 头部布局不够自然。
   已补充响应式规则：小屏改为纵向堆叠、tab 横向滚动、内容区恢复全宽，桌面端仍保留原有左右分栏。
7. code-reviewer 第一轮发现 Next dev server 曾把 `apps/content-growth-platform/next-env.d.ts` 改成 `.next/dev/types/routes.d.ts`。该文件不在本轮授权范围，已用补丁恢复为基线 `./.next/types/routes.d.ts`；最终 `git status` 不再包含该文件。

完成后对本轮允许组件和 `src/app/dashboard/**` 做黑金 token 扫描，目标组件未再命中：

- `bg-[#0a0a0a]`
- `bg-[#111111]`
- `bg-[#050505]`
- `bg-black`
- `text-white`
- `border-white/*`
- `amber`

剩余命中只在上一轮已验收的 `consultation-workspace.tsx` 内，属于历史抽屉遮罩和主按钮白字，不是本轮待修页面的旧黑金主题。

## 验证

已执行：

```bash
git diff --check
```

结果：通过。

已执行：

```bash
pnpm --dir apps/content-growth-platform lint
```

结果：通过，仍保留 2 个历史 warning：

1. `scripts/migrate-factory-source-items-to-merchant-media.mjs` 的 `sourceItem` unused。
2. `src/server/api/video-job-payload.ts` 的 `buildMissingVideoAssetHints` unused。

已执行：

```bash
pnpm --dir apps/content-growth-platform typecheck
```

结果：失败，原因仍是历史 Supabase 残留 import，不属于本轮 UI 改动：

```text
src/lib/supabase/admin.ts(3,30): error TS2307: Cannot find module '@supabase/supabase-js' or its corresponding type declarations.
src/lib/supabase/browser.ts(1,37): error TS2307: Cannot find module '@supabase/ssr' or its corresponding type declarations.
src/lib/supabase/server.ts(3,36): error TS2307: Cannot find module '@supabase/ssr' or its corresponding type declarations.
src/lib/supabase/server.ts(...): cookiesToSet/name/value/options implicit any
```

没有安装或恢复 `@supabase/*`，也没有修改依赖文件。为让 worktree 可验证，执行过：

```bash
pnpm install --frozen-lockfile --ignore-scripts
```

结果：通过，仅生成 ignored 的本地依赖目录，`git status` 未出现依赖文件改动。

浏览器验证：

- 启动 worktree 服务：`pnpm --dir apps/content-growth-platform dev --port 3002`
- 从 `http://localhost:3002/login?demo=1&next=%2Fdashboard%2Farticle` 使用 demo 账号登录成功。
- 桌面视口 `1440x900` 检查：
  - `/dashboard/consultation`
  - `/dashboard/article`
  - `/dashboard/video`
  - `/dashboard/content`
  - `/dashboard/history`
  - `/dashboard/settings`
  - `/dashboard/team`
- 移动视口 `390x844` 检查同一组页面。
- 第一轮截图发现图文、视频、用户信息、团队成员在移动端存在按钮/分栏拥挤。修复响应式布局后复查：
  - 上述页面 `documentElement` 横向 overflow 均为 `0`。
  - 可见大面积深色背景块计数均为 `0`。
  - 浏览器 console error 为 `0`。
  - 手工查看移动截图，图文、视频、用户信息、团队成员不再出现标题按钮挤压成竖排的问题。
- 额外点击 `/dashboard/settings` 内的“用户知识库”tab，验证内嵌知识库 / 项目媒体素材区：横向 overflow 为 `0`，可见大面积深色背景块计数为 `0`。

Code review：

- 第一轮 `code-reviewer` 结论：`修复后再审`。
- 阻塞项：`apps/content-growth-platform/next-env.d.ts` 被 Next dev server 写入本地 `.next/dev` 路径，且 progress 未记录该非授权文件改动。
- 修复结果：已还原 `next-env.d.ts`；最终 `git status --short` 只剩 8 个授权 UI 组件和本 progress 文档。

## 风险和未覆盖

1. `typecheck` 仍因历史 Supabase import 失败。正确修复方向是清理、替换或隔离旧 Supabase 残留，而不是恢复 Supabase 依赖。
2. 本轮是视觉 token 收敛，没有重新设计信息架构；少数紧凑工具界面仍保留原有布局密度。
3. 视频工作台只做 className / token cleanup，没有重写状态机、上传或剪辑逻辑。
4. 浏览器验证覆盖了页面初始态和设置页知识库 tab，未逐一触发所有上传、弹窗、生成中、失败态；这些状态的 className 已纳入代码层 token 扫描。

## 恢复路径

如需回退本轮 UI 收敛，可回退本分支未提交 diff，或在集成后 revert 对应提交。
