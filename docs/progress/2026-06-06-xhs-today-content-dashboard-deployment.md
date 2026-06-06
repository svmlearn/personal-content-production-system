# 2026-06-06 小红书今日内容 Dashboard 化部署记录

## 范围

用户确认：今日内容不应该继续作为 `/member/calendar` 手机端 / 成员端页面跳出，而应留在用户工作台内，作为网页端 dashboard 模块承接。

本轮将小红书内容平台的主演示入口从 `/member/calendar` 切回 `/dashboard/today`，并部署到 `https://xhs.2young.xin`。

## 本地与远端

- 本地分支：`main`
- Gitee remote：`git@gitee.com:mr_wang112/personal-website.git`
- 本轮功能提交：`eba678a feat: move today content into dashboard`
- 推送范围：`b19de45..eba678a`
- 注意：推送中包含此前本地已存在但尚未推送的文档提交 `3d2b835 docs: add harness web runner PRD`。

## 代码改动

核心路径：

- 新增 `/dashboard/today`
- 新增 `/dashboard/today/article/[taskId]`
- 新增 `/dashboard/today/video/[taskId]`
- Dashboard 左侧导航 `今日内容` 从 `/member/calendar` 改为 `/dashboard/today`
- 团队选题生成批次后的 `进入今日内容` 从 `/member/calendar` 改为 `/dashboard/today`
- Dashboard 今日图文 / 今日视频卡片分别跳到 `/dashboard/today/article/:id` 和 `/dashboard/today/video/:id`
- `/member/...` 路由继续保留给真实成员端兼容，不删除

同时清理了用户可见测试内容：

- 首页用户入口文案改为 `团队选题、营销内容日历和今日内容`
- 视频链路绕过草稿的可见标题、脚本、标签、镜头文案从 `链路测试 / 测试素材 / 占位脚本` 改为 `今日内容 / 团队素材`
- 技术 trace 字段仍保留 test/bypass 命名，避免破坏 smoke 工具和后台排查

## 本地验证

- `git diff --check`：通过
- `pnpm --dir apps/content-growth-platform lint`：通过，仍有 2 个既有 warning：
  - `scripts/migrate-factory-source-items-to-merchant-media.mjs` 中 `sourceItem` 未使用
  - `src/server/api/video-job-payload.ts` 中 `buildMissingVideoAssetHints` 未使用
- `pnpm --dir apps/content-growth-platform typecheck`：通过
- `pnpm --dir apps/content-growth-platform build`：通过
- 本地 dev server 验证：
  - `GET /dashboard/today`：新路由被识别；无登录态按 dashboard layout 307 到登录页
  - `GET /dashboard/today/article/smoke-task`：新动态路由被识别；无登录态 307
  - `GET /dashboard/today/video/smoke-task`：新动态路由被识别；无登录态 307

## 服务器部署

服务器：

- 腾讯云轻量：`43.129.207.237`
- SSH user：`ubuntu`
- SSH key：`/Users/wy/.ssh/tencent_lighthouse_personal_website`
- 仓库目录：`/opt/personal-website`
- PM2 服务：`content-growth-platform`

过程：

1. 服务器部署前状态：
   - commit：`b19de45`
   - `git status --short --branch`：`## main...origin/main`
   - `content-growth-platform` online
2. 本地推送 Gitee：
   - `git push origin main`
   - 结果：`b19de45..eba678a  main -> main`
3. 服务器同步：
   - `git fetch origin main`
   - `git merge --ff-only origin/main`
   - 结果：fast-forward 到 `eba678a`
   - `git status --short --branch`：`## main...origin/main`
4. 服务器构建：
   - `pnpm --dir apps/content-growth-platform build`
   - 结果：通过
   - build 路由列表包含：
     - `/dashboard/today`
     - `/dashboard/today/article/[taskId]`
     - `/dashboard/today/video/[taskId]`
5. PM2 重启：
   - `pm2 restart content-growth-platform --update-env`
   - 重启后 pid：`682397`
   - 状态：online

本轮没有执行 `pnpm install --frozen-lockfile`，因为未修改 package / lockfile。

## 线上验证

服务器本机：

- 当前 commit：`eba678a`
- `git status --short --branch`：`## main...origin/main`
- `GET http://127.0.0.1:3001/dashboard/today`：
  - 无登录态按预期 `307`
  - Location：`/login?error=unauthenticated&next=/dashboard`

公网：

- `GET https://xhs.2young.xin/dashboard/today`：
  - 无登录态按预期 `307`
  - Location：`/login?error=unauthenticated&next=/dashboard`
- `POST https://xhs.2young.xin/api/auth/merchant-login`：
  - 使用演示账号
  - 返回 `303`
  - Location：`https://xhs.2young.xin/dashboard/today`
- 登录 cookie 下请求 `https://xhs.2young.xin/dashboard/today`：
  - HTML 匹配 `今日内容`
  - HTML 匹配 `团队选题`
  - HTML 不匹配 `/member/calendar`
  - HTML 匹配 `/dashboard/today`

## 当前状态

代码已推送 Gitee，服务器已拉取到 `eba678a`，`content-growth-platform` 已重启并在线。

今日内容主入口现在留在 dashboard 工作台：

- `https://xhs.2young.xin/dashboard/today`

保留兼容入口：

- `https://xhs.2young.xin/member/calendar`

## 遗留风险

1. 图文 / 视频详情页当前复用原 `MemberArticleTaskPage` / `MemberVideoTaskPage`，只是放进 dashboard shell 并配置返回 `/dashboard/today`。如果要彻底桌面化，需要下一轮拆成 `merchant/dashboard` 专用详情组件。
2. 本轮只重启了 `content-growth-platform`，没有重启 `content-generation-worker`、`ai-learning-companion`、`fde-ai-empowerment`。
3. 公网 HTML 验证使用 curl 文本匹配，未做真实浏览器截图验证。
