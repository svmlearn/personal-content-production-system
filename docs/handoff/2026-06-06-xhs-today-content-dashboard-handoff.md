# 小红书今日内容 Dashboard 化 Handoff

日期：2026-06-06  
分支 / 工作区：`main` 当前工作区  
状态：待验收 / 未 commit / 未 push / 未 merge

## 目标

用户反馈：`https://xhs.2young.xin/member/calendar` 现在仍像之前的成员端 / 手机端页面；今日内容不应该作为独立 `member` 页面跳出去，而应该留在前面的用户工作台里，作为网页端 dashboard 模块承接。

本轮按这个口径调整：

- `今日内容` 主入口留在 `/dashboard/...` 工作台内。
- 不再从 dashboard 导航或团队选题出口跳到 `/member/calendar`。
- `/member/calendar`、`/member/article/:id`、`/member/video/:id` 仍保留给真实成员端兼容，不删除。

## 已完成

1. 新增 dashboard 今日内容路由：
   - `/dashboard/today`
   - `/dashboard/today/article/[taskId]`
   - `/dashboard/today/video/[taskId]`

2. Dashboard 主导航调整：
   - `今日内容` 从 `/member/calendar` 改为 `/dashboard/today`。

3. 团队选题生成批次后的出口调整：
   - `进入今日内容` 从 `/member/calendar` 改为 `/dashboard/today`。

4. Dashboard 今日内容卡片调整：
   - 今日图文跳 `/dashboard/today/article/:id`。
   - 今日视频跳 `/dashboard/today/video/:id`。

5. 图文 / 视频任务详情复用原成员端任务组件，但增加 `backHref` 参数：
   - 成员端默认仍返回 `/member/calendar`。
   - Dashboard 详情页返回 `/dashboard/today`。

6. 顺手清理了可见测试内容口径：
   - 首页用户入口文案改成 `团队选题、营销内容日历和今日内容`。
   - 视频链路绕过草稿的用户可见标题、脚本、标签、镜头文案从 `链路测试 / 测试素材 / 占位脚本` 改为 `今日内容 / 团队素材` 口径。
   - 技术 trace 字段仍保留 test/bypass 命名，避免破坏 smoke 工具和后台排查。

## 改动文件

- `apps/content-growth-platform/src/app/page.tsx`
- `apps/content-growth-platform/src/app/dashboard/today/page.tsx`
- `apps/content-growth-platform/src/app/dashboard/today/article/[taskId]/page.tsx`
- `apps/content-growth-platform/src/app/dashboard/today/video/[taskId]/page.tsx`
- `apps/content-growth-platform/src/components/app/dashboard-shell.tsx`
- `apps/content-growth-platform/src/components/merchant/consultation-workspace.tsx`
- `apps/content-growth-platform/src/components/merchant/daily-tasks-workspace.tsx`
- `apps/content-growth-platform/src/components/member/member-workspace.tsx`
- `apps/content-growth-platform/src/server/api/video-chain-test-draft.ts`
- `apps/content-growth-platform/src/server/api/video-chain-test-draft.test.ts`

## 验证结果

- `git diff --check`：通过。
- `pnpm --dir apps/content-growth-platform lint`：通过，剩余 2 个既有 warning：
  - `scripts/migrate-factory-source-items-to-merchant-media.mjs` 中 `sourceItem` 未使用
  - `src/server/api/video-job-payload.ts` 中 `buildMissingVideoAssetHints` 未使用
- `pnpm --dir apps/content-growth-platform typecheck`：通过。
- 本地 dev server：
  - 启动：`pnpm --dir apps/content-growth-platform dev --port 3001`
  - URL：`http://localhost:3001`
- HTTP 路由验证：
  - `GET /dashboard/today`：新路由被识别，无登录态下按 dashboard layout 307 到 `/login?error=unauthenticated&next=/dashboard`
  - `GET /dashboard/today/article/smoke-task`：新动态路由被识别，同样 307
  - `GET /dashboard/today/video/smoke-task`：新动态路由被识别，同样 307

## 已知限制

- 本地没有有效登录态 / demo seed，本轮没有在真实 dashboard 数据态下截图验证。
- 图文 / 视频详情页目前复用原成员端任务组件，只是被放进 dashboard shell；行为已经不跳 member，但细节视觉还不是完全重做的桌面端信息架构。
- 如果要进一步产品化，下一步应把图文详情和视频剪辑详情拆成真正的 `merchant/dashboard` 桌面组件，而不是继续复用 `MemberArticleTaskPage` / `MemberVideoTaskPage`。

## 下一步建议

1. 在有登录态的环境打开 `/dashboard/today`，确认左侧导航高亮和今日内容数据加载。
2. 点今日图文 / 今日视频，确认 URL 仍在 `/dashboard/today/...`。
3. 如果视觉验收认为详情页仍太像手机端，再做第二轮桌面化改造。
