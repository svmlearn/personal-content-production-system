# 2026-06-07 XHS 视频脚本窄桌面高度裁剪排查

## 问题原貌

用户反馈视频脚本页仍有显示问题：

- 已不是整页白屏。
- 内容可以继续往下滑看到，但当前视口里像有一块白色挡板盖在前面。
- 视觉表现为本应展示完整的镜头内容，现在大约只有一部分可见，剩余部分需要不断滚动才能看到。
- 用户截图对应今日视频任务：
  - `/dashboard/today/video/ee026522-5c16-4300-b1a3-166fcb49fc2b`
  - 标题：`能力展示片段 · 成熟配套`
  - 镜头 1：`开场痛点口播`

## 取证

生产站点用 Playwright 登录 demo 后复现：

- 宽屏 CSS 视口 `2048x1260` 下没有复现。
- 按 Retina 截图形态改用 `deviceScaleFactor=2`，CSS 视口约 `1024x630` 后复现临界布局问题。
- 生成截图：
  - `/tmp/xhs-20260607-video-occlusion/narrow-1024.png`
  - `/tmp/xhs-20260607-video-occlusion/narrow-1024-full.png`

关键 DOM / 布局指标：

- 页面任务数据正常：
  - `[data-video-scene-id]` 数量为 7。
  - 镜头 1、镜头 2 文案都在 DOM 中。
- `1024px` CSS 宽度刚好触发 `lg` 桌面布局：
  - 左侧 sidebar 出现。
  - `main` 使用 `lg:h-screen lg:overflow-hidden lg:p-10`。
- 真实滚动容器：
  - class：`h-full min-h-0 overflow-y-auto bg-[#fbfaf7]`
  - `clientHeight: 548`
  - `scrollHeight: 3183`
  - rect：`top: 41, bottom: 589`
- 第一张镜头卡：
  - rect：`top: 484, bottom: 916`
  - 高度：`432`
- 在 `y=620` 做 `elementFromPoint`：
  - 命中的不是镜头内容，而是外层 `MAIN`
  - `MAIN` class：`min-w-0 flex-1 p-4 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden lg:p-10`
  - `MAIN` 的 `overflowY` 是 `hidden`

结论：内容并没有丢，真正被看到的滚动窗口被 `lg:p-10` 压短了；窗口底部之外由外层 `MAIN` 的白色区域接管，于是用户看起来像有一块白板挡住内容。

## 根因

上轮已经修掉了两个问题：

1. 视频镜头从单个超长 section 拆成独立卡片。
2. DashboardShell 中 `{children}` 双渲染已修为单渲染。

本轮暴露的是第三层问题：

- dashboard 在 `lg` 临界宽度就启用桌面固定高度布局。
- 同时 `main` 在 `lg` 下使用 `p-10`，上下各 40px。
- 对 CSS 高度约 630px 的 Retina / 缩放 / 截图场景来说，内容卡片实际只剩约 548px 高。
- 详情页内部滚动容器只能在这 548px 内显示内容；底部剩余区域被外层 `overflow-hidden` 的白色主容器裁住。

这就是用户描述的“前方有白色挡板挡住，只能不断往下滑去看”。

## 实际改动

- `apps/content-growth-platform/src/components/app/dashboard-shell.tsx`
  - 将 dashboard 主内容区的响应式 padding 从 `lg:p-10` 调整为：
    - 基础 / `lg`：沿用 `p-4`
    - `xl`：`p-6`
    - `2xl`：`p-10`
  - 目标是避免在 1024px / 1100px 这类窄桌面或 Retina 临界宽度下，固定高度内容窗口被大 padding 压短。

改动前：

```tsx
<main className="min-w-0 flex-1 p-4 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden lg:p-10">
```

改动后：

```tsx
<main className="min-w-0 flex-1 p-4 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden xl:p-6 2xl:p-10">
```

## 本地验证

已通过：

- `git diff --check`
- `pnpm --dir apps/content-growth-platform typecheck`
- `pnpm --dir apps/content-growth-platform build`
- `pnpm --dir apps/content-growth-platform lint`
  - 仍只有两个既有 warning：
    - `scripts/migrate-factory-source-items-to-merchant-media.mjs` 的 `sourceItem` 未使用。
    - `src/server/api/video-job-payload.ts` 的 `buildMissingVideoAssetHints` 未使用。

## 待线上验证

部署后需要复测：

1. 用生产 demo 登录。
2. 打开 `/dashboard/today/video/ee026522-5c16-4300-b1a3-166fcb49fc2b`。
3. 使用 `1024x630 / DPR 2` 视口复测。
4. 确认滚动容器 bottom 接近视口底部，不再在页面中段被 `MAIN` 接管。
5. 截图留存修复后同视口状态。

## 未覆盖与风险

1. 本轮只修 dashboard shell 高度裁剪，不改 AI 剪辑、上传和数据结构。
2. 如果用户实际浏览器缩放比例更极端，仍可能需要进一步把 sidebar 桌面断点从 `lg` 推迟到 `xl`。
3. 当前没有 Safari/WebKit 自动化验证；上轮 WebKit 安装未成功。
