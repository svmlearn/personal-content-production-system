# 2026-06-07 XHS 视频脚本上传后白色遮挡排查

## 问题原貌

用户反馈视频脚本详情页在点击镜头素材上传后，页面又出现下半部分被白色区域挡住的问题：

- 不点击上传时，镜头 1 的内容可正常滚动查看。
- 点击上传或选择素材后，上传框附近开始出现一大块白色遮挡。
- 用户描述为“点上传的时候又这样了”，怀疑上传动作触发了额外行为。

对应生产入口：

- `/dashboard/today/video/ee026522-5c16-4300-b1a3-166fcb49fc2b`
- 任务标题：`能力展示片段 · 成熟配套`
- 镜头 1：`开场痛点口播`

## 取证

生产站点 Playwright 复现环境：

- CSS 视口：`1024x630`
- `deviceScaleFactor: 2`
- 登录生产 demo 账号后打开视频任务详情页。
- 截图与度量输出目录：`/tmp/xhs-20260607-upload-focus`

上传前关键指标：

- 真正滚动容器：
  - class：`h-full min-h-0 overflow-y-auto bg-[#fbfaf7]`
  - `scrollTop: 0`
  - `clientHeight: 596`
  - rect：`top: 17, bottom: 613`
- 镜头 1 卡片：
  - rect：`top: 460, bottom: 872`
- 上传 label：
  - rect：`top: 809, bottom: 855`
- `sr-only` file input：
  - rect：`top: 831.5, bottom: 832.5`
- 视口探针：
  - `y=600` 命中镜头 1 section，说明未上传前内容区域本身不是白屏。

选择文件但不强制 focus input 后：

- `scrollTop` 仍为 `0`。
- 镜头 1 与上传行位置基本不变。
- 文件名已经变为 `upload-test.mp4`，说明 React 状态更新本身不会直接造成遮挡。

强制让隐藏 file input 获得焦点后：

- 滚动容器 `scrollTop` 仍为 `0`，但 rect 变为：
  - `top: -500`
  - `bottom: 96`
- 镜头 1 卡片 rect 变为：
  - `top: -57`
  - `bottom: 355`
- 上传 label rect 变为：
  - `top: 292`
  - `bottom: 338`
- active element 变成：
  - `INPUT[type=file].sr-only`
- `y=520` 到 `y=610` 命中的都是外层白色内容容器，而不是镜头文本。

结论：

- 这不是接口没返回内容，也不是镜头 DOM 丢失。
- 这也不是单纯选择文件后的 React 状态更新。
- 核心触发点是隐藏的 `input[type=file].sr-only` 获得焦点后，浏览器为了把这个 1px 隐藏输入框滚入视口，触发了 document 级滚动，导致 dashboard 固定高度内容被整体上移，视口下半截只剩外层白色容器。

## 根因判断

视频镜头素材上传行原实现为：

- 整行 `<label>` 可点击。
- label 内放置 `input[type=file]`。
- file input 使用 Tailwind `sr-only` 隐藏。

`sr-only` 的实际布局特征是：

- `position: absolute`
- `width/height: 1px`
- `clip-path: inset(50%)`
- `margin: -1px`
- 仍然存在于布局 / 焦点系统中。

在 dashboard 的嵌套结构里，这个 1px input 位于当前视口下方。用户点击上传时，浏览器可能把 file input 设为焦点目标；文件选择器关闭后，浏览器尝试将焦点元素滚入可视区域。由于外层 dashboard 使用 `h-screen` 和多层 `overflow-hidden`，这个滚动没有进入正确的内容滚动容器，而是把 document / app 根区域整体上移，最终形成用户看到的白色遮挡。

## 实际改动

- `apps/content-growth-platform/src/components/member/member-workspace.tsx`
  - 将镜头必传素材上传控件从 `<label> + sr-only input>` 改为：
    - 可见上传区域用普通 `<div>`。
    - 右侧“选择 / 已选择”使用真实 `<button type="button">`。
    - button 通过 `useRef` 主动调用对应 scene 的 hidden file input `.click()`。
    - file input 改为 `className="hidden"`，即 `display: none`，并设置 `tabIndex={-1}` 和 `aria-hidden="true"`。
  - 保持原有选择文件后的状态更新、文件大小展示和 `setActionError(null)` 行为不变。

修复意图：

- 保留原生文件选择能力。
- 让隐藏 file input 不再作为可滚动焦点目标参与页面滚动。
- 避免点击上传后浏览器把 dashboard 页面整体滚偏。

## 本地验证

已通过：

- `git diff --check`
- `pnpm --dir apps/content-growth-platform typecheck`
- `pnpm --dir apps/content-growth-platform lint`
  - 仅保留两个既有 warning：
    - `scripts/migrate-factory-source-items-to-merchant-media.mjs` 的 `sourceItem` 未使用。
    - `src/server/api/video-job-payload.ts` 的 `buildMissingVideoAssetHints` 未使用。
- `pnpm --dir apps/content-growth-platform build`

## 待线上验证

代码部署后需要用同一生产任务复测：

- CSS 视口：`1024x630`
- `deviceScaleFactor: 2`
- 打开 `/dashboard/today/video/ee026522-5c16-4300-b1a3-166fcb49fc2b`
- 点击镜头 1 上传按钮并选择测试文件。
- 预期：
  - 文件名能展示为已选择。
  - 内容容器 rect 不再被 focus 触发到 `top: -500`。
  - 视口下半部分不再命中外层白色容器。

## 未覆盖与风险

1. 本轮只修镜头素材上传控件，不改声音克隆上传。声音克隆入口也使用 `label + sr-only input`，但它位于页面更靠后且不是本次截图触发点；若未来出现同类遮挡，可按同样模式改造。
2. 本轮不改变真实媒体上传、AI 剪辑 job 创建、OSS / DB / worker 链路。
3. Safari/WebKit 仍未做自动化验证；当前取证和验证基于 Chromium。
