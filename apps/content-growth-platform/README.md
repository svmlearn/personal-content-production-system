# Content Growth Platform

正式应用路径：`apps/content-growth-platform/`。

本目录从 ignored 参考副本 `refrences/小红书抖音矩阵获客平台/app/` 提升而来。参考副本仍保留在原位置，不作为正式实现入口。

迁移时未纳入：

- `node_modules/`
- `.next/`
- `*.tsbuildinfo`
- 本地 `.env*`
- 缓存、覆盖率、构建产物

## Local Dev

从仓库根目录运行：

```bash
pnpm install --frozen-lockfile
pnpm dev:content-growth
```

或在本应用目录内运行：

```bash
pnpm dev --port 3001
```

当前登录页支持演示入口：

```text
/login?demo=1&next=%2Fdashboard
```

这个入口只会预填演示账号，不会绕过原登录链路。要真正进入 dashboard，需要先配置 PostgreSQL，并 seed 受限 demo owner / merchant。

## Validation

从仓库根目录运行：

```bash
pnpm lint:content-growth
pnpm typecheck:content-growth
pnpm build:content-growth
```
