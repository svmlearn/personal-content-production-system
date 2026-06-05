# 小红书今日内容主链路收口 Handoff

日期：2026-06-06  
分支：`codex/xhs-today-content-main-flow`  
基线：`main` 本地 commit `e2dde03 docs: archive agent console migration and today content PRD`  
状态：待验收 / 待合并决策

## 目标

按 `docs/产品文档/2026-06-05-小红书今日内容主链路收口PRD.md` 做最小实现收口：

- 不重写旧 `article-workbench.tsx` / `video-workbench.tsx`。
- 主导航隐藏旧 `生成图文`、`生成视频`。
- 将 `成员端预览` 产品化为 `今日内容`，入口直达 `/member/calendar`。
- 让 `团队选题 -> 营销内容日历 -> 生成团队本周内容 -> 今日内容 -> 今日图文 / 今日视频` 成为主演示链路。

## 已完成

1. `DashboardShell` 主导航已移除旧工作台入口：
   - 删除 `生成图文` `/dashboard/article`
   - 删除 `生成视频` `/dashboard/video`
   - 删除 `成员端预览` `/member`
   - 新增 `今日内容` `/member/calendar`

2. 登录与成员端文案已按新链路调整：
   - 用户登录页强调 `团队选题、营销内容日历和今日内容`
   - 成员登录页强调进入 `今日内容`
   - 成员端 header 从 `静境成员端 / Mobile execution` 改为 `今日内容 / Daily content`
   - `/member/calendar` 页面标题、loading、error、刷新 aria、返回链接改为 `今日内容`

3. 团队选题生成批次后增加明确出口：
   - `TeamGenerationStatusBanner` 中新增 `进入今日内容` 链接，跳转 `/member/calendar`
   - 不改 Dify 调用逻辑，不把 Dify 搬进前端

4. 半遗留 `DailyTasksWorkspace` 已同步新口径：
   - 页面标题与 loading/error 改为 `今日内容`
   - owner/member 均打开 `/member/article/:id` 和 `/member/video/:id`
   - 图文卡 action 从 `生成图文` 改为 `查看图文`

## 改动文件

- `apps/content-growth-platform/src/components/app/dashboard-shell.tsx`
- `apps/content-growth-platform/src/components/app/merchant-login-form.tsx`
- `apps/content-growth-platform/src/components/merchant/consultation-workspace.tsx`
- `apps/content-growth-platform/src/components/merchant/daily-tasks-workspace.tsx`
- `apps/content-growth-platform/src/components/member/member-workspace.tsx`
- `apps/content-growth-platform/src/app/member/login/page.tsx`

## 保留不动

- `/dashboard/article` 和 `/dashboard/video` 路由仍保留。
- 旧 `article-workbench.tsx` / `video-workbench.tsx` 内部的标题、错误提示、生成按钮未清理；它们属于兼容路由，不再出现在主导航。
- `history-hub.tsx` 中历史视频详情的 `回到视频工作台` 未改；这是历史内容回看入口，不是主演示链路。

## 验证结果

- `git diff --check`：通过，无输出。
- `pnpm --dir apps/content-growth-platform lint`：通过，剩余 2 个既有 warning：
  - `scripts/migrate-factory-source-items-to-merchant-media.mjs` 中 `sourceItem` 未使用
  - `src/server/api/video-job-payload.ts` 中 `buildMissingVideoAssetHints` 未使用
- 本地 dev server：
  - 启动命令：`pnpm --dir apps/content-growth-platform dev --port 3001`
  - 结果：`http://localhost:3001` ready
- 浏览器验证：
  - 打开 `http://localhost:3001/login?demo=1&next=%2Fdashboard%2Fconsultation`
  - 已确认登录页新文案显示：`使用演示账号进入团队选题、营销内容日历和今日内容。`
  - 点击 demo 登录后当前本地数据库返回 `invalid-credentials`，与 README 中“demo 入口只预填账号，不绕过认证；需要 seed demo owner / merchant”一致。因此鉴权后的 dashboard 页面未在浏览器中完成实机验证。

## 已知风险

- 本轮未 seed 本地 demo owner，因此只能通过代码、lint 和登录页渲染确认鉴权前与静态路径；鉴权后 UI 建议在已有 demo 数据库环境中再点一遍。
- `DailyTasksWorkspace` 当前未被路由直接引用，但已按今日内容口径修正，避免未来接回旧链路。
- 视频 `AI 一键剪辑` 能力沿用现有成员端视频任务页，没有新增演示假进度或预置成片。

## 下一步建议

1. 在有 demo seed 的本地或测试环境验证：
   - `/dashboard/consultation` 侧边栏不出现 `生成图文`、`生成视频`
   - 点击 `今日内容` 进入 `/member/calendar`
   - 今日图文进入 `/member/article/:id`
   - 今日视频进入 `/member/video/:id`
2. 如果面试演示一定需要视频“假成片”闭环，再单独做一个小 PRD/实现，不要混在这次入口收口里。
3. 验收后再决定是否合并本分支到 `main`；当前未 push、未 merge。
