# 2026-05-28 Jingjing UI PRD Stage 0 Handoff

## 当前目标

把“作品集真实项目入口 + 小红书平台 UI 重塑”整理成零上下文可执行的 PRD，并先完成小红书平台 Stage 0 视觉试改。

本轮不改信息层级、不改业务链路、不改 API / DB / worker / OSS / Dify / Postgres 相关逻辑。

## 已完成

1. 新增 PRD：
   - `docs/产品文档/2026-05-28-作品集真实项目入口与小红书UI重塑PRD.md`
2. 更新文档索引：
   - `docs/README.md`
3. 按用户上一轮要求删除静态作品集底部说明区：
   - `网站内容/index.html`
   - `网站内容/styles.css`
4. 完成小红书平台 Stage 0 UI 视觉试改：
   - `refrences/小红书抖音矩阵获客平台/app/src/app/layout.tsx`
   - `refrences/小红书抖音矩阵获客平台/app/src/app/globals.css`
   - `refrences/小红书抖音矩阵获客平台/app/src/app/page.tsx`
   - `refrences/小红书抖音矩阵获客平台/app/src/components/app/dashboard-shell.tsx`

UI 方向从原黑金感调整为更适合 AI 营销内容平台的浅色运营工作台：暖白底、珊瑚红主行动、青绿色 AI 辅助色、轻量边框和运营型信息密度。当前只改外层视觉和全局气质，没有重排导航、入口、页面结构或业务流程。

## PRD 已补强的关键点

PRD 现在已经写明：

1. 真实目录边界和 `refrences` 拼写。
2. 作品集未来如迁移技术栈，目标目录固定为 `portfolio-app/`。
3. “启动项目”按钮的真实含义是跳转到已运行服务，不是在浏览器里启动进程。
4. 小红书 UI 分为 Stage 0 和 Stage 1。
5. Stage 0 只允许修改 4 个文件。
6. 禁止触碰 API、数据库、worker、OSS、Dify、Postgres 和环境变量契约。
7. 因 `refrences/` 被 `.gitignore` 忽略，小红书项目改动不能只依赖主仓 git diff，需要另行保留 patch、独立 git 或 handoff 证据。
8. 提供了给零上下文 Agent 使用的完整实现提示词。

## 验证结果

在 `refrences/小红书抖音矩阵获客平台/app` 下执行：

1. `pnpm install --frozen-lockfile`
   - 通过。
   - 有 `msw` build scripts ignored 的 pnpm 提示，未处理。
2. `pnpm lint`
   - 通过。
   - 保留既有 warning：
     - `scripts/migrate-factory-source-items-to-merchant-media.mjs` unused `sourceItem`
     - `src/server/api/video-job-payload.ts` unused `buildMissingVideoAssetHints`
3. `pnpm typecheck`
   - 失败。
   - 失败点是既有 Supabase 依赖缺失：
     - `@supabase/supabase-js`
     - `@supabase/ssr`
   - 相关文件在 `src/lib/supabase/**`，本轮未修改。
4. `pnpm build`
   - Next.js 编译阶段通过。
   - 类型检查阶段因同一 Supabase 缺失依赖失败。
5. `pnpm dev --port 3001`
   - 可启动。
   - 已完成浏览器验证后关闭本地服务。

浏览器验证覆盖：

1. `/`
2. `/login`
3. `/dashboard`

视口覆盖：

1. `1440x900`
2. `768x1024`
3. `390x844`

结论：

1. 无横向溢出。
2. 无 console error。
3. `/dashboard` 在未登录状态跳转到 `/login?error=unauthenticated&next=/dashboard`，符合当前未登录环境预期。

## 当前风险

1. `refrences/` 在根仓 `.gitignore` 中被忽略，小红书 UI 改动不会出现在根仓提交里。
2. 当前小红书项目目录没有独立 `.git`，后续如要正式交付，需要导出 patch、初始化独立仓库，或把该项目移出被忽略目录。
3. Stage 0 只覆盖首页和 dashboard shell，登录页内部卡片、商家工作台深层页面、内容生产链路页面仍可能保留旧黑色风格。
4. `pnpm typecheck` / `pnpm build` 的失败来自既有 Supabase 缺失依赖，不应被误判为本轮 UI 改动引入。

## 建议下一步

1. 先确认 PRD 中 Stage 0 / Stage 1 的边界是否符合预期。
2. 如果继续小红书 UI，下一轮应单独开 Stage 1 任务，逐页覆盖 login、consultation、daily-tasks、article、video、content-center。
3. 如果继续作品集真实入口，应按 PRD 把静态作品集迁移到 `portfolio-app/`，再加入项目详情页到小红书真实服务的跳转配置。
4. 在正式开发小红书项目之前，先决定 `refrences/` 下改动的版本管理方式。

## Git 状态说明

根仓当前可提交内容只包含：

1. `docs/README.md`
2. `docs/产品文档/2026-05-28-作品集真实项目入口与小红书UI重塑PRD.md`
3. `docs/handoff/2026-05-28-jingjing-ui-prd-stage0-handoff.md`
4. `网站内容/index.html`
5. `网站内容/styles.css`

小红书 UI 改动位于被忽略的 `refrences/`，不会随根仓 commit 提交。
