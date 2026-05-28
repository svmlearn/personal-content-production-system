# 2026-05-29 Demo Login And Runtime Handoff

## 当前状态

本轮目标是让作品集里的“小红书抖音矩阵获客平台”项目可以跳转到真实本地小红书平台，并让外部访客看到一个低门槛的演示登录入口。

已经完成：

1. 作品集 Matrix 项目详情里新增“进入该项目”按钮。
2. 按本地环境生成链接：
   - 本地 `127.0.0.1:8080` 访问作品集时，按钮跳到 `http://localhost:3001/login?demo=1&next=%2Fdashboard`
   - 未来服务器 IP 访问作品集时，会跳到同一 host 的 `3001` 端口。
3. 小红书平台 `/login?demo=1` 会自动填充演示账号。
4. 平台首页展示名从“静境内容获客平台”改为“内容获客平台”。
5. 入口按钮相关静态作品集改动已在根仓提交：
   - `ae29e42 Add Jingjing project entry link`

## 当前本地服务

当前通过 `tmux` 启动了两个本地服务：

1. 作品集静态站：
   - URL: `http://127.0.0.1:8080/`
   - tmux session: `personal-portfolio-8080`
2. 小红书 / 内容获客平台：
   - URL: `http://localhost:3001/`
   - tmux session: `jingjing-app-3001`

停止命令：

```bash
tmux kill-session -t personal-portfolio-8080
tmux kill-session -t jingjing-app-3001
```

## 当前演示登录状态

登录页现在只做了“预填充”，没有绕过登录链路。

预填充账号：

- email: `demo@jingjing.local`
- password: `jingjing-demo`

原因：

1. 保留原认证链路可以避免后续 dashboard、API、cookie、用户态校验出现一堆假成功。
2. 对外展示时不应该要求招聘方手动输入账号密码。
3. 也不应该把真实账号密码硬编码进前端。

当前限制：

1. 本地 PostgreSQL 还没有起来。
2. `APP_DATABASE_URL` / `DATABASE_URL` 还没有配置。
3. 演示账号还没有 seed 到数据库。
4. 所以现在点击登录会进入原登录接口，但会返回 `auth-not-configured`，这是预期的未完成状态。

## Docker / 数据库未完成事项

本机 Docker CLI 可用，但 Docker daemon 未运行。

已验证：

```bash
docker --version
```

可返回版本。

但：

```bash
docker ps
```

报错：

```text
Cannot connect to the Docker daemon at unix:///Users/wy/.docker/run/docker.sock. Is the docker daemon running?
```

因此本轮没有启动 PostgreSQL 容器，也没有执行 migrations / seed。

明天接续时建议：

1. 先打开 Docker Desktop。
2. 启动 PostgreSQL 容器，建议固定端口 `5432` 或确认空闲端口。
3. 配置小红书 app 的 `.env.local`：
   - `DATABASE_PROVIDER=postgres`
   - `APP_DATABASE_URL=postgres://...`
   - `APP_SESSION_COOKIE=jingjing_session`
   - `APP_SESSION_SECURE_COOKIE=false`
   - `NEXT_PUBLIC_DEMO_MERCHANT_EMAIL=demo@jingjing.local`
   - `NEXT_PUBLIC_DEMO_MERCHANT_PASSWORD=jingjing-demo`
4. 按顺序执行 `app/db/migrations/` 下的 PostgreSQL migrations。
5. 用 `scripts/create-domestic-password-hash.mjs` 生成 `jingjing-demo` 的 hash。
6. 运行 `db/seeds/domestic_minimal_seed.example.sql`，seed 一个受限 demo owner 和 merchant。
7. 再运行必要的 fixture seed，保证 dashboard 里有可展示数据。
8. 重启 `jingjing-app-3001`。
9. 验证从作品集按钮进入登录页，点击登录后可进入 `/dashboard/consultation`。

## 需要注意的版本管理问题

`refrences/` 目录被根仓 `.gitignore` 忽略。

因此以下小红书平台改动不会进入根仓 commit：

1. Stage 0 UI 改造：
   - `app/src/app/layout.tsx`
   - `app/src/app/globals.css`
   - `app/src/app/page.tsx`
   - `app/src/components/app/dashboard-shell.tsx`
2. 演示登录预填充：
   - `app/src/app/(auth)/login/page.tsx`
   - `app/src/components/app/merchant-login-form.tsx`
   - `app/.env.example`
3. 平台展示名调整：
   - `app/src/app/layout.tsx`
   - `app/src/app/page.tsx`

明天如果要正式保留小红书项目改动，需要先决定：

1. 把 `refrences/小红书抖音矩阵获客平台/app` 初始化成独立 git 仓库；或
2. 把小红书项目移出被忽略目录；或
3. 从 ignored 目录导出 patch 作为交付证据。

## 已验证

1. `node --check 网站内容/script.js` 通过。
2. `git diff --check` 通过。
3. 小红书 app `pnpm lint` 通过，只有既有 warning：
   - `scripts/migrate-factory-source-items-to-merchant-media.mjs` unused `sourceItem`
   - `src/server/api/video-job-payload.ts` unused `buildMissingVideoAssetHints`
4. 浏览器验证：
   - 作品集 Matrix 按钮可见。
   - 按钮指向 `http://localhost:3001/login?demo=1&next=%2Fdashboard`。
   - 登录页能自动填充演示账号。
   - 登录页无横向溢出、无 console error。

## 明天建议第一步

先不要继续改 UI。

明天第一步应先把“demo 账号能真实登录进入 dashboard”跑通：

1. Docker Desktop 打开。
2. PostgreSQL 容器启动。
3. migrations 执行。
4. demo owner / merchant seed。
5. 从作品集按钮完整走到 dashboard。

这一步跑通后，再继续做小红书平台深层页面 UI。
