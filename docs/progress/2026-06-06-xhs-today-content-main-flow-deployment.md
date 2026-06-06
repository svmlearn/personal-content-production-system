# 2026-06-06 小红书今日内容主链路部署记录

## 范围

将小红书内容平台「今日内容」主链路收口改动合并到本地 `main`，推送到 Gitee `main`，并同步到腾讯云服务器。

## 本地与远端提交

- 功能提交：`78c1bef feat: streamline xhs today content flow`
- 构建修复提交：`c234b1b fix: add supabase compatibility dependencies`
- Gitee remote：`git@gitee.com:mr_wang112/personal-website.git`
- Gitee `main` 已推送到：`c234b1b`

## 部署服务器

- 服务器：腾讯云轻量，`43.129.207.237`
- SSH user：`ubuntu`
- SSH key：`/Users/wy/.ssh/tencent_lighthouse_personal_website`
- 仓库目录：`/opt/personal-website`
- PM2 服务：`content-growth-platform`

## 过程记录

1. 本地在分支 `codex/xhs-today-content-main-flow` 完成改动并提交 `78c1bef`。
2. 本地 `main` 通过 fast-forward 合并该分支。
3. 推送 Gitee `main`：`560e903..78c1bef`。
4. 服务器执行 `git fetch origin main` 后发现：
   - 服务器工作区有本地未提交改动：`apps/portfolio/script.js`
   - 该改动与远端后续域名入口变更一致
5. 为避免覆盖服务器现场，先备份并 stash：
   - 备份 patch：`/opt/personal-website-deploy-backups/pre-today-content-20260606004026.patch`
   - stash message：`pre-today-content-deploy portfolio script domain diff`
6. 服务器 fast-forward 拉取到 `78c1bef`。
7. 首次服务器构建失败：
   - 命令：`pnpm --dir apps/content-growth-platform build`
   - 错误：`Cannot find module '@supabase/supabase-js'`
   - 原因：之前进入 `main` 的 Supabase 兼容文件引用了 `@supabase/supabase-js` / `@supabase/ssr`，但内容平台 package 依赖缺失。
8. 本地补依赖：
   - `@supabase/ssr`
   - `@supabase/supabase-js`
   - 本地 build 通过。
9. 提交并推送修复：`c234b1b fix: add supabase compatibility dependencies`
10. 服务器再次 fast-forward 到 `c234b1b`，执行：
    - `pnpm install --frozen-lockfile`
    - `pnpm --dir apps/content-growth-platform build`
    - `pm2 restart content-growth-platform --update-env`

## 验证结果

### 本地验证

- `git diff --check`：通过。
- `pnpm --dir apps/content-growth-platform lint`：通过，仍有 2 个既有 warning：
  - `scripts/migrate-factory-source-items-to-merchant-media.mjs` 的 `sourceItem` 未使用。
  - `src/server/api/video-job-payload.ts` 的 `buildMissingVideoAssetHints` 未使用。
- `pnpm --dir apps/content-growth-platform build`：通过。

### 服务器验证

- 服务器当前 commit：`c234b1b`
- 服务器 git 状态：`main...origin/main`
- PM2 状态：
  - `content-growth-platform` online
  - 重启后 pid：`586642`
- 服务器本机访问：
  - `http://127.0.0.1:3001/login?demo=1`：`200`
  - `http://127.0.0.1:3001/member/login`：`200`
  - 登录后本机访问 `http://127.0.0.1:3001/dashboard/consultation`：`200`，耗时约 `0.035s`
- 公网登录接口：
  - `POST https://xhs.2young.xin/api/auth/merchant-login`
  - 返回 `303`
  - `Location: https://xhs.2young.xin/dashboard/consultation`
- 公网 `/member/calendar`：
  - 未登录时按预期 `307` 到 `/member/login?...`
  - 登录 cookie 下返回 `200`，HTML 中能匹配 `今日内容`
- 公网 `/dashboard/consultation`：
  - 返回头为 `200 OK`
  - HTML 中能匹配 `今日内容` 和 `团队选题`
  - HTML 中未匹配到旧主导航文案 `生成图文` / `生成视频`
  - curl 在等待 chunked 响应收尾时 20 秒超时，但已收到首屏 HTML 片段和目标文案；服务器本机同路由访问正常。

## 当前状态

代码已推送 Gitee，服务器已拉取并重启内容平台。

线上主链路入口已更新：

- 侧边栏保留 `团队选题`
- 新增/显示 `今日内容`
- 主导航不再显示 `生成图文` / `生成视频`
- `今日内容` 指向 `/member/calendar`

## 遗留风险

1. 服务器保留了一个部署前 stash，用于保存当时的 `apps/portfolio/script.js` 本地现场。该 diff 已被远端历史覆盖，正常情况下无需恢复。
2. 公网 curl 对 `/dashboard/consultation` 的 chunked 响应没有在 20 秒内自然结束，但首屏 HTML 已返回且本机访问很快。若浏览器侧出现持续 loading，再查 Next streaming / Nginx proxy buffering。
3. 本次只重启了 `content-growth-platform`，未重启 `ai-learning-companion` 和 `fde-ai-empowerment`。
