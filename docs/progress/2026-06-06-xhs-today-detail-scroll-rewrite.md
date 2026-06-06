# 2026-06-06 XHS 今日内容详情滚动与图文改写记录

## 问题原貌

用户在 `https://xhs.2young.xin/member/calendar` 迁入 dashboard 后的今日内容详情页发现：

1. 视频脚本详情页在 dashboard 工作台内向下滚动时，后半部分内容被裁掉，页面表现为外层整体滚动或底部留白，而不是详情内容块自己滚动。
2. 图文详情页存在相似的内容展示不全问题。
3. 图文详情页需要增加一个轻量改写入口：用户输入改写建议，点击“一键改写”，系统基于当前 Dify / 今日任务已生成内容改写，不再引入旧图文工作台的多来源复杂入口。

## 根因判断

`/dashboard/today/article/[taskId]` 与 `/dashboard/today/video/[taskId]` 复用了 member 端详情组件，但 dashboard shell 的主区域是固定高度：

- `DashboardShell`：`h-screen overflow-hidden`
- 内层 card：`min-h-0 flex-1 overflow-hidden`

member 详情组件原本按独立移动端页面写，没有在 dashboard 子路由外层提供 `h-full min-h-0 overflow-y-auto`，因此长内容会被 dashboard 固定容器裁切。

图文改写方面，旧图文工作台已有 `/api/content/article-drafts/revisions` 与 `reviseArticleDraftForUser()`，其底层使用 `buildReviseTask()` / `buildArticleGenerationMessages()` 的“基于当前版本和自然语言修改意见生成 1 个新版本”提示词。本次新增今日内容专用入口，优先复用该旧改写链路。

## 实际改动

代码改动：

- `apps/content-growth-platform/src/app/dashboard/today/article/[taskId]/page.tsx`
  - 增加 dashboard 内部滚动容器。
  - 启用 `enableArticleRewrite`。
- `apps/content-growth-platform/src/app/dashboard/today/video/[taskId]/page.tsx`
  - 增加 dashboard 内部滚动容器。
- `apps/content-growth-platform/src/components/member/member-workspace.tsx`
  - `MemberArticleTaskPage` 增加可选 `enableArticleRewrite`。
  - dashboard 今日图文详情页显示“一键改写”输入框和按钮。
  - 改写成功后直接替换当前页面展示的标题、正文、标签和 CTA。
- `apps/content-growth-platform/src/app/api/daily-content-tasks/[taskId]/article-rewrite/route.ts`
  - 新增今日图文改写 API。
- `apps/content-growth-platform/src/server/api/schemas.ts`
  - 新增 `reviseDailyArticleTaskSchema`。
- `apps/content-growth-platform/src/server/api/content-generation-service.ts`
  - 新增 `reviseDailyArticleTaskForUser()`。
  - 若今日任务已绑定 `contentVariantId`，复用旧图文工作台 `reviseArticleDraftForUser()`，让改写进入内容草稿版本链。
  - 若今日任务没有绑定草稿版本，则使用相同文章提示词模板做 standalone revise，并把结果写回 `daily_content_tasks.article_task.generatedArticle`。

数据写入：

- 改写后的结果写回 `daily_content_tasks.article_task.generatedArticle`。
- 同步更新 `article_task.title`、`generationStatus`。
- 有草稿链路时保留 / 更新 `contentDraftId` 与 `contentVariantId`。

## 验证证据

本地验证：

- `git diff --check`：通过。
- `pnpm --dir apps/content-growth-platform lint`：通过，仍有 2 个既有 warning：
  - `scripts/migrate-factory-source-items-to-merchant-media.mjs` 的 `sourceItem` 未使用。
  - `src/server/api/video-job-payload.ts` 的 `buildMissingVideoAssetHints` 未使用。
- `pnpm --dir apps/content-growth-platform typecheck`：通过。
- `pnpm --dir apps/content-growth-platform build`：通过。
  - Next route 表包含新路由：`/api/daily-content-tasks/[taskId]/article-rewrite`。
  - dashboard 今日内容详情路由仍正常编译：`/dashboard/today/article/[taskId]`、`/dashboard/today/video/[taskId]`。

本地浏览器验证边界：

- 本地服务可启动：`http://127.0.0.1:3100`。
- 使用历史 demo 账号 `demo@jingjing.local / jingjing-demo` 登录本地库返回 `invalid-credentials`，与此前 handoff 中“本地没有 seed demo owner”的记录一致。
- 因 dashboard layout 必须真实登录并查商家档案，本轮未在本地完成鉴权后截图验证。

## 隐性风险与未覆盖范围

1. 新增改写按钮会触发真实 LLM 改写；本地没有登录态，因此未实际调用线上模型完成端到端文案改写。
2. standalone revise 分支会写回 `daily_content_tasks`，但不会创建新的 `content_drafts` 版本；只有今日任务本身已有关联 `contentVariantId` 时，才进入旧图文工作台版本链。
3. 线上部署后需要用真实 demo 登录态检查：
   - 图文详情页底部图片区能否完整滚动到。
   - 视频脚本详情页镜头列表能否完整滚动到。
   - 图文“一键改写”输入建议后是否返回新版内容并持久化。

## 回滚路径

若线上出现问题：

1. 回滚代码 commit。
2. 重启 `content-growth-platform` PM2 服务。
3. 若只是个别任务文案改写不符合预期，可从 `daily_content_tasks.article_task.generatedArticle` 的历史备份 / 草稿版本链恢复；本次不做批量数据迁移。
