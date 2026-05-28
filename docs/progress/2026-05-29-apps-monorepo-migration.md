# 2026-05-29 Apps Monorepo Migration Progress

## 目标

把个人作品集主页和内容获客平台从“静态目录 + ignored reference 副本”的状态，收口到正式 `apps/` 应用目录。

迁移后的结构：

```text
个人网站搭建/
  apps/
    portfolio/
    content-growth-platform/
  docs/
  refrences/
```

## 实际改动

1. 原 `网站内容/` 通过 `git mv` 迁移到：
   - `apps/portfolio/`
2. 原 ignored 参考副本：
   - `refrences/小红书抖音矩阵获客平台/app/`
   复制为正式应用：
   - `apps/content-growth-platform/`
3. 保留 `refrences/` 原目录作为 ignored 历史参考副本，不删除。
4. 新增根级 monorepo 管理文件：
   - `package.json`
   - `pnpm-workspace.yaml`
   - `pnpm-lock.yaml`
5. 删除子应用内 `pnpm-workspace.yaml` 和子应用 lockfile，改为根级 workspace + 根级 lockfile。
6. 根级 `pnpm-lock.yaml` 保留参考副本旧 lock 的解析版本，只把 importer 从 `.` 改成 `apps/content-growth-platform`，避免迁移时顺带升级依赖。
7. 更新：
   - `.gitignore`
   - `AGENTS.md`
   - `docs/README.md`
   - `docs/产品文档/2026-05-28-作品集真实项目入口与小红书UI重塑PRD.md`
   - `apps/content-growth-platform/README.md`

## 排除内容

迁移没有纳入以下内容：

1. `node_modules/`
2. `.next/`
3. `.turbo/`
4. `.cache/`
5. `coverage/`
6. `out/`
7. `build/`
8. `dist/`
9. `.vercel/`
10. `*.tsbuildinfo`
11. 本地 `.env*`

当前本地仍存在一些 ignored 验证产物，例如：

- `apps/content-growth-platform/node_modules/`
- `apps/content-growth-platform/.next/`
- `apps/content-growth-platform/tsconfig.tsbuildinfo`

它们不会进入 git。做快照部署前建议清理。

## 验证结果

已执行：

```bash
node --check apps/portfolio/script.js
git diff --check
pnpm install --lockfile-only --frozen-lockfile
pnpm --dir apps/content-growth-platform lint
pnpm --dir apps/content-growth-platform typecheck
pnpm --dir apps/content-growth-platform build
```

结果：

1. `node --check apps/portfolio/script.js` 通过。
2. `git diff --check` 通过。
3. `pnpm install --lockfile-only --frozen-lockfile` 通过，确认根级 workspace lockfile 和 package 配置一致。
4. `pnpm --dir apps/content-growth-platform lint` 通过，但保留既有 warning：
   - `scripts/migrate-factory-source-items-to-merchant-media.mjs` unused `sourceItem`
   - `src/server/api/video-job-payload.ts` unused `buildMissingVideoAssetHints`
5. `pnpm --dir apps/content-growth-platform typecheck` 失败，仍是迁移前已知 Supabase 依赖缺失：
   - `@supabase/supabase-js`
   - `@supabase/ssr`
   - 以及由缺失类型引起的隐式 `any`
6. `pnpm --dir apps/content-growth-platform build` 编译通过，但 TypeScript 阶段因同一 Supabase 缺失依赖失败。

本地服务验证：

```bash
python3 -m http.server 8080 -d apps/portfolio
pnpm --dir apps/content-growth-platform dev --port 3001
```

结果：

1. `http://127.0.0.1:8080/` 返回 200。
2. `http://localhost:3001/` 返回 200。
3. `http://localhost:3001/login?demo=1&next=%2Fdashboard` 返回 200。
4. 内容平台首页标题为“内容获客平台”。
5. demo 登录页能渲染演示账号预填充。
6. 作品集脚本仍生成 `login?demo=1&next=%2Fdashboard` 入口。

浏览器自动化补充说明：

Codex in-app browser 在本轮两次初始化验证脚本时超时并重置；因此最终以 HTTP 响应和页面 HTML 检查完成冒烟验证。服务本身已通过 curl 200 和页面内容检查。

## Code Review 反馈与处理

已使用 `code-reviewer` 子 agent 审查迁移。

Reviewer 阻塞反馈：

1. 根级 `dev:content-growth` 没有指定 `3001`，和作品集入口不一致。
2. 缺少 `docs/progress/` 迁移记录。
3. 根级 workspace 与子应用 lockfile 策略不清。

处理结果：

1. `package.json` 已改为：
   - `pnpm --dir apps/content-growth-platform dev --port 3001`
2. 已补充本 progress 文件。
3. 已收口为根级 `pnpm-workspace.yaml` + 根级 `pnpm-lock.yaml`，删除子应用 `pnpm-workspace.yaml` 和 `pnpm-lock.yaml`。
4. 第二轮 reviewer 发现初版根 lockfile 发生依赖漂移；已重建根 lockfile，使其继承参考副本原有解析版本。
5. `pnpm install --lockfile-only --frozen-lockfile` 已通过，确认修正后的 lockfile 可被 pnpm 接受。

## 未完成事项

1. Docker daemon 当前未运行，PostgreSQL 容器还没有启动。
2. `APP_DATABASE_URL` / `DATABASE_URL` 还没有配置。
3. demo 账号 `demo@jingjing.local` / `jingjing-demo` 还没有 seed 到数据库。
4. 登录页目前只做预填充，不绕过认证；点击登录仍会走原认证链路。
5. 内容平台的 `video-worker` 仍只在 ignored `refrences/小红书抖音矩阵获客平台/workers/video-worker/` 中，本轮没有迁入。
6. `pnpm typecheck` / `pnpm build` 仍被旧 Supabase 依赖问题阻塞。

## 恢复路径

如果要回退本次目录迁移：

1. 回退本次迁移 commit。
2. 恢复 `网站内容/` 作为作品集目录。
3. 删除 `apps/content-growth-platform/`、根级 `package.json`、根级 `pnpm-workspace.yaml`、根级 `pnpm-lock.yaml`。
4. 继续以 ignored `refrences/` 副本作为参考，不作为正式实现入口。

## 下一步建议

下一轮优先不要继续 UI。

建议先跑通真实 demo 登录链路：

1. 打开 Docker Desktop。
2. 启动 PostgreSQL 容器。
3. 配置 `apps/content-growth-platform/.env.local`。
4. 执行 `apps/content-growth-platform/db/migrations/`。
5. 用 `apps/content-growth-platform/scripts/create-domestic-password-hash.mjs` 生成 `jingjing-demo` 密码 hash。
6. 运行 `apps/content-growth-platform/db/seeds/domestic_minimal_seed.example.sql`。
7. 从 `apps/portfolio` 的“进入该项目”完整进入 `/dashboard/consultation`。
