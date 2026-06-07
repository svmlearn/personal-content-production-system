# 2026-06-07 XHS 未来内容可进入详情修复

## 问题原貌

用户反馈 `今日内容` 页面下方的 `未来 7 天` 已经有 Dify 生成出的真实内容，但卡片不能点击进入详情。

截图对应页面：

- `/dashboard/today`
- 模块：`未来 7 天`
- 卡片状态：多条显示 `Dify 已生成`
- 用户期望：像今日内容一样，未来已生成的内容也能进入图文详情或视频脚本详情，后续复制、改写、上传素材、demo AI 剪辑等逻辑复用已有详情页。

## 根因判断

当前 dashboard 今日内容页：

- 今日图文 / 今日视频使用 `TaskCard`，分别链接到：
  - `/dashboard/today/article/:taskId`
  - `/dashboard/today/video/:taskId`
- 未来 7 天区域只渲染静态 `div` 卡片。
- 后端 `workspace.upcoming` 实际已经返回 `DailyContentTaskDto[]`，每个未来任务也有完整 `id / articleTask / videoTask / generationStatus / generatedArticle / generatedVideoScript / contentDraftId / contentVariantId`。

因此问题不是数据缺失，而是 UI 没把未来任务的详情入口挂出来。

## 实际改动

- `apps/content-growth-platform/src/components/merchant/daily-tasks-workspace.tsx`
  - 将未来 7 天静态卡片改为 `FutureTaskCard`。
  - 每张未来卡片保留日期、主题、图文标题和 Dify 状态。
  - 新增两个操作入口：
    - `查看图文` -> `/dashboard/today/article/:taskId`
    - `看脚本` -> `/dashboard/today/video/:taskId`
  - 只有对应图文 / 视频已生成时才渲染为可点击链接。
  - 未生成、排队中或生成中时，操作保留灰色不可点击状态，避免误跳空详情。
- `apps/content-growth-platform/src/components/member/member-workspace.tsx`
  - 同步补齐成员端 `/member/calendar` 的未来内容入口：
    - `查看图文` -> `/member/article/:taskId`
    - `查看脚本` -> `/member/video/:taskId`
  - 判断口径与 dashboard 一致。

## 已生成判断口径

任一条件满足即认为对应内容可进入详情：

- `generationStatus === "succeeded"`
- 已有 `generatedArticle`
- 已有 `generatedVideoScript`
- 已有 `contentDraftId` 且已有 `contentVariantId`

这个判断兼容当前 Dify 写回后的数据形态，也避免只依赖单一状态字段导致已生成内容不可点。

## 本地验证

已通过：

- `git diff --check`
- `pnpm --dir apps/content-growth-platform typecheck`
- `pnpm --dir apps/content-growth-platform lint`
  - 仍只有两个既有 warning：
    - `scripts/migrate-factory-source-items-to-merchant-media.mjs` 的 `sourceItem` 未使用。
    - `src/server/api/video-job-payload.ts` 的 `buildMissingVideoAssetHints` 未使用。
- `pnpm --dir apps/content-growth-platform build`

## 待线上验证

部署后使用生产 demo 账号验证：

1. 打开 `/dashboard/today`。
2. 滚动到 `未来 7 天`。
3. 确认已生成卡片出现 `查看图文` 和 `看脚本`。
4. 点击未来任务的 `查看图文`，应进入 `/dashboard/today/article/:taskId` 并显示对应任务内容。
5. 返回后点击未来任务的 `看脚本`，应进入 `/dashboard/today/video/:taskId` 并显示对应视频脚本。

## 未覆盖与风险

1. 本轮不改变 Dify 生成、任务写回、任务日期计算和后端 API。
2. 未来任务详情页继续复用当前 article/video route，页面顶部仍显示 `返回今日内容`，这是现有详情页文案，未在本轮扩展为动态日期文案。
3. 如果未来某一天只有图文生成成功、视频还在队列中，则只允许进入图文，视频入口保持不可点。
