# 2026-05-29 Content Platform Demo Login Progress

## 目标

跑通个人作品集到内容获客平台的本地 demo 登录链路。

目标入口：

- 作品集：`http://127.0.0.1:8080/`
- 内容获客平台：`http://localhost:3001/`
- 作品集项目按钮：`http://localhost:3001/login?demo=1&next=%2Fdashboard`
- 登录账号：`demo@jingjing.local`
- 登录密码：`jingjing-demo`
- 预期最终落点：`/dashboard/consultation`

## 基线判断

1. 当前 git 基线为 `3387500 Move portfolio and content platform into apps workspace`。
2. 正式代码入口为：
   - `apps/portfolio/`
   - `apps/content-growth-platform/`
3. `refrences/` 仍是 ignored 历史参考副本，本轮没有修改。
4. Supabase 仍是历史残留，不是当前主线；本轮没有安装或恢复 `@supabase/*`。
5. Long-task-gate: disabled。
6. 本轮没有派发 implementer 做代码实现，因为实际工作是本地 Docker/PostgreSQL/env/seed 验证，没有业务代码改动；派发了只读 explorer 梳理 demo 登录依赖。

## 本地 PostgreSQL

启动 Docker Desktop 后创建本地 PostgreSQL 容器：

```bash
docker run -d --name content-growth-postgres \
  -e POSTGRES_USER=content_growth \
  -e POSTGRES_PASSWORD=content_growth_dev \
  -e POSTGRES_DB=content_growth_dev \
  -p 5433:5432 \
  -v content-growth-postgres-data:/var/lib/postgresql/data \
  pgvector/pgvector:pg16
```

实际结果：

- 容器名：`content-growth-postgres`
- 镜像：`pgvector/pgvector:pg16`
- 本机端口：`5433`
- 数据库：`content_growth_dev`
- 用户：`content_growth`
- volume：`content-growth-postgres-data`
- 健康检查：`docker exec content-growth-postgres pg_isready -U content_growth -d content_growth_dev` 返回 accepting connections。

注意：Docker 在 Apple Silicon 上提示该镜像为 `linux/amd64`，但本轮运行和迁移均正常。

## 本地 env

新增本地未跟踪文件：

- `apps/content-growth-platform/.env.local`

该文件被 `.gitignore` 忽略，未提交。

本地 demo 最小配置口径：

```bash
DATABASE_PROVIDER=postgres
APP_DATABASE_URL=postgresql://content_growth:content_growth_dev@127.0.0.1:5433/content_growth_dev
DATABASE_URL=postgresql://content_growth:content_growth_dev@127.0.0.1:5433/content_growth_dev
APP_DATABASE_SSL=false
APP_DATABASE_POOL_MAX=8
APP_SESSION_COOKIE=jingjing_session
APP_SESSION_TTL_SECONDS=1209600
APP_SESSION_SECURE_COOKIE=false
APP_BASE_URL=http://localhost:3001
NEXT_PUBLIC_DEMO_MERCHANT_EMAIL=demo@jingjing.local
NEXT_PUBLIC_DEMO_MERCHANT_PASSWORD=jingjing-demo
```

本轮没有配置 OSS、Dify、AI provider 或 worker secret，所以只验证登录和 dashboard 入口，不声明全业务链路可用。

## Migration

按文件名顺序执行了全部正式迁移：

```bash
DATABASE_URL="postgresql://content_growth:content_growth_dev@127.0.0.1:5433/content_growth_dev"
for f in apps/content-growth-platform/db/migrations/*.sql; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
done
```

结果：

- 全部 migration 成功。
- `202605160002_selfhost_pgvector_optional.sql` 成功执行；当前容器镜像支持 pgvector。
- 首次空库出现的 `trigger does not exist` / `constraint does not exist` notice 属于幂等迁移预期。

## Seed

用正式脚本生成 demo 密码 hash：

```bash
node apps/content-growth-platform/scripts/create-domestic-password-hash.mjs jingjing-demo
```

然后执行最小 seed：

```bash
psql "$DATABASE_URL" \
  -v ON_ERROR_STOP=1 \
  -v user_email="demo@jingjing.local" \
  -v password_hash="$HASH" \
  -v display_name="Content Growth Demo Owner" \
  -v merchant_name="内容获客平台演示商家" \
  -f apps/content-growth-platform/db/seeds/domestic_minimal_seed.example.sql
```

seed 后状态：

- `public.app_users`：1 条，`demo@jingjing.local`，`merchant_owner`，`active`
- `public.merchant_profiles`：1 条，`内容获客平台演示商家`，`active`，`free`
- `public.merchant_team_members`：1 条，`owner`，`active`

demo seed 当前包含这三张表。代码会在 owner profile 存在时自动确保 owner membership；非 owner 成员仍依赖 active team membership。登录最关键的硬前提是 `app_users` active、密码 hash 正确、并且该用户能解析到 active merchant profile。

## 浏览器验证

已启动 / 使用的本地服务：

```bash
python3 -m http.server 8080 -d apps/portfolio
pnpm --dir apps/content-growth-platform dev --port 3001
```

3001 dev server 已重启，启动日志确认读取：

```text
Environments: .env.local
```

验证路径：

1. 打开 `http://127.0.0.1:8080/`。
2. 在作品集项目切换到 `Matrix Growth`。
3. 验证“进入该项目”链接 href 为：
   - `http://localhost:3001/login?demo=1&next=%2Fdashboard`
4. 进入上述链接。
5. 登录页显示 demo 账号预填：
   - email: `demo@jingjing.local`
   - password: `jingjing-demo`
6. 点击“登录”。
7. 实际跳转：
   - `POST /api/auth/merchant-login` -> 303
   - `GET /dashboard` -> 307
   - `GET /dashboard/consultation` -> 200
8. 浏览器最终 URL：
   - `http://localhost:3001/dashboard/consultation`
9. 浏览器 console error：
   - `[]`

服务端日志显示 consultation 相关接口返回 200：

```text
GET /api/consultation/sessions 200
GET /api/consultation/experts 200
POST /api/consultation/sessions 201
```

半成功 / 副作用记录：

- 进入 `/dashboard/consultation` 后，当前前端在空库状态下自动创建了 2 条 `consultation_sessions`。这是本地 demo 验证产生的数据，未清理。
- 未登录状态下直接 `curl -I http://localhost:3001/dashboard/consultation` 返回 307 到 `/login?error=unauthenticated&next=/dashboard`，这是 dashboard guard 的预期行为。

## 验证命令

通过：

```bash
node --check apps/portfolio/script.js
git diff --check
pnpm --dir apps/content-growth-platform lint
```

`pnpm --dir apps/content-growth-platform lint` 仍只有迁移前已知 warning：

```text
scripts/migrate-factory-source-items-to-merchant-media.mjs
  sourceItem is assigned a value but never used

src/server/api/video-job-payload.ts
  buildMissingVideoAssetHints is defined but never used
```

数据库检查：

```bash
node apps/content-growth-platform/scripts/check-domestic-app-env.mjs \
  --env-file apps/content-growth-platform/.env.local
```

结果解读：

- database_url: ok
- DATABASE_PROVIDER: ok
- database select 1: ok
- requiredTablesPresent: true
- missingTables: []
- 整体 status: failed，因为本地没有配置 Aliyun OSS 和 `PRIVATE_MEDIA_DOWNLOAD_TOKEN_SECRET`

这说明数据库与登录基础表可用，但素材 / OSS / 视频链路未配置。

未通过且仍是历史残留：

```bash
pnpm --dir apps/content-growth-platform typecheck
pnpm --dir apps/content-growth-platform build
```

失败原因：

- `src/lib/supabase/admin.ts` 缺 `@supabase/supabase-js`
- `src/lib/supabase/browser.ts` 缺 `@supabase/ssr`
- `src/lib/supabase/server.ts` 缺 `@supabase/ssr`
- `src/lib/supabase/server.ts` 里由缺失类型引起隐式 `any`

本轮没有通过安装 Supabase 依赖绕过失败。正确后续方向仍是清理、替换或隔离旧 Supabase 残留。

## 恢复路径

停止本地数据库：

```bash
docker stop content-growth-postgres
```

重新启动本地数据库：

```bash
docker start content-growth-postgres
```

彻底删除本轮本地数据库和数据：

```bash
docker rm -f content-growth-postgres
docker volume rm content-growth-postgres-data
```

重新验证 demo 登录：

```bash
docker start content-growth-postgres
pnpm --dir apps/content-growth-platform dev --port 3001
python3 -m http.server 8080 -d apps/portfolio
```

然后访问：

- `http://127.0.0.1:8080/`
- 项目 `Matrix Growth`
- `进入该项目`

如果登录失败，优先排查：

1. `apps/content-growth-platform/.env.local` 是否存在且指向 `127.0.0.1:5433`。
2. `docker exec content-growth-postgres pg_isready -U content_growth -d content_growth_dev` 是否正常。
3. `public.app_users` 是否有 `demo@jingjing.local` 且 `status='active'`。
4. `public.merchant_profiles.owner_user_id` 是否指向该 user。
5. owner 用户通常会被代码自动确保 owner membership；如果是非 owner 成员，再检查 `public.merchant_team_members.user_id` 是否指向该 user，且 `role` / `status` 可用。
6. `APP_SESSION_SECURE_COOKIE` 是否为 `false`，否则 HTTP localhost 不会正常保存 cookie。

## 当前结论

本地 demo 登录链路已跑通：

```text
作品集 8080 -> 内容获客平台 login 3001 -> demo 账号认证 -> /dashboard -> /dashboard/consultation
```

未覆盖：

1. OSS / 私有素材下载。
2. Dify / LLM / 内容生成 worker。
3. 视频 worker。
4. `pnpm typecheck` / `pnpm build` 的 Supabase 历史残留清理。
