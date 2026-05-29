# 2026-05-29 Consultation UI Light Pass

## 目标

修复内容获客平台 `/dashboard/consultation` 页面视觉断裂问题。

用户反馈：

- 咨询对话区有大面积黑色残留。
- 页面外壳是浅色，内部对话、输入区、右侧策略资产是黑金风格，和粉白选中态放在一起很突兀。
- 目标不是继续大改信息架构，而是把咨询页内部视觉统一到浅色内容工作台。

## 根因判断

`apps/content-growth-platform/src/components/merchant/consultation-workspace.tsx` 仍大量保留早期黑金后台样式：

- `bg-[#0a0a0a]`
- `bg-[#111111]`
- `bg-[#050505]`
- `bg-black/*`
- `border-white/10`
- `text-white/*`
- `amber` 金色状态色

这些样式没有随着外层 `DashboardShell` 和登录后主框架的浅色工作台改造一起收口，导致同一页面内出现：

- 左侧浅色导航
- 中间白色主画布
- 黑色输入和策略资产区
- 珊瑚粉选中态

视觉系统冲突明显。

## 实际改动

修改文件：

- `apps/content-growth-platform/src/components/merchant/consultation-workspace.tsx`
- `apps/content-growth-platform/next.config.ts`

主要调整：

1. 将咨询页根容器设为浅色背景和深色正文。
2. 将页面头部、session tab、tool cards、消息区、输入区、右侧策略资产、历史抽屉、内容日历弹窗统一为浅色卡片体系。
3. 将旧黑金色系替换为：
   - 主背景：`#fbfaf7`
   - 卡片 / 输入：`white`、`#fffaf7`
   - 边框：`#eadfd7`
   - 主文字：`#1f2328`
   - 次级文字：`#6f625d` / `#8b7b72`
   - 主操作：`#f2556b` / `#e94b73`
   - 可执行状态：`#22b8a7` / `#0f766e`
   - 轻量提醒：`#fff7ed` / `#c46a00`
4. 保留用户消息的珊瑚色填充，用来区分对话角色；助手消息改为白色卡片。
5. 右侧“我的策略资产”从黑色侧栏改为浅色信息栏。
6. 历史记录抽屉和内容日历弹窗同步改浅，避免打开浮层后又回到黑金风格。
7. `next.config.ts` 增加 `devIndicators: false`，关闭本地 Next.js dev 模式底部黑色 `N` 指示器，避免本地演示截图中出现不属于业务 UI 的黑色浮标。

未改动：

- 未修改接口、数据库、auth、worker、seed。
- tracked diff 未涉及 env 文件；ignored `.env.local` 本轮未做内容审计。
- 未修改 `refrences/`。
- 未恢复或安装 Supabase 依赖。
- 未调整页面信息层级、模块命名和业务流程。

## 验证

已执行：

```bash
pnpm --dir apps/content-growth-platform lint
git diff --check
pnpm --dir apps/content-growth-platform typecheck
```

结果：

1. `pnpm --dir apps/content-growth-platform lint` 通过，仍只有两个既有 warning：
   - `scripts/migrate-factory-source-items-to-merchant-media.mjs` 的 `sourceItem` unused
   - `src/server/api/video-job-payload.ts` 的 `buildMissingVideoAssetHints` unused
2. `git diff --check` 通过。
3. `pnpm --dir apps/content-growth-platform typecheck` 仍失败，原因仍是旧 Supabase 残留：
   - `src/lib/supabase/admin.ts` 缺 `@supabase/supabase-js`
   - `src/lib/supabase/browser.ts` / `server.ts` 缺 `@supabase/ssr`
   - 以及缺失类型造成的隐式 `any`

本轮没有通过安装 Supabase 依赖绕过该失败。

## 浏览器验证

本地服务：

```bash
python3 -m http.server 8080 -d apps/portfolio
pnpm --dir apps/content-growth-platform dev --port 3001
```

验证页面：

- `http://localhost:3001/dashboard/consultation`

结果：

- 页面成功渲染。
- 浏览器最终 URL：`http://localhost:3001/dashboard/consultation`
- console error 数量：`0`
- 业务区域黑色残留已清除。
- Next dev 黑色 `N` 指示器已关闭。
- 视口横向溢出检查通过：
  - `390x844`: `scrollWidth === innerWidth`
  - `768x1024`: `scrollWidth === innerWidth`
  - `1440x900`: `scrollWidth === innerWidth`

本地截图留存：

- `/tmp/content-growth-consultation-ui-light-no-dev-indicator.png`
- 注：文件扩展名为 `.png`，但当前 browser screenshot 输出经 `file` 识别为 JPEG 数据；本轮只作为本地视觉留痕，不提交仓库。

## 风险和未覆盖

1. 本轮只修 `/dashboard/consultation`，其他页面如 settings、history、team、knowledge library 仍可能有早期黑金残留。
2. 没有运行 `build`，因为当前 `typecheck` 已被旧 Supabase 残留阻塞；运行 build 仍会在 TypeScript 阶段失败。
3. 关闭 `devIndicators` 只影响本地开发体验，不改变生产业务行为。

## 恢复路径

如果要回退本轮 UI 修复：

```bash
git revert <本轮提交>
```

如果只想恢复 Next dev indicator，删除 `apps/content-growth-platform/next.config.ts` 中的：

```ts
devIndicators: false,
```

## 当前结论

咨询页视觉断裂已修复为浅色工作台风格。当前页面不再出现用户截图中的黑色对话区、黑色输入区和黑色策略资产侧栏。
