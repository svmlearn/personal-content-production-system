# 2026-06-06 XHS 视频脚本镜头内容显示不全排查

## 问题原貌

用户在 `https://xhs.2young.xin/dashboard/today/video/7765283b-df5e-4946-b8e4-6db11b52ef7b` 的视频脚本详情页反馈：

- 选择视频素材后，页面下方有一部分镜头内容直接显示不出来。
- 截图中可见镜头 1 的上传框和镜头 2 标题，但镜头 2 的正文、拍法、提示及后续镜头区域变成大块空白。
- 用户要求先通读相关组件和代码，找核心原因后再修改。

## 取证

相关代码：

- `apps/content-growth-platform/src/app/dashboard/today/video/[taskId]/page.tsx`
  - dashboard 视频详情页使用 `h-full min-h-0 overflow-y-auto` 作为滚动容器。
- `apps/content-growth-platform/src/components/app/dashboard-shell.tsx`
  - 桌面 dashboard 外层是 `h-screen overflow-hidden`，内容卡片也是 `overflow-hidden`。
- `apps/content-growth-platform/src/components/member/member-workspace.tsx`
  - `MemberVideoTaskPage` 同时服务 `/member/video/[taskId]` 和 `/dashboard/today/video/[taskId]`。
  - 视频镜头原实现把所有 `script.scenes` 放在同一个 `section` 里，用一个 `divide-y` 容器连续渲染。
  - 选择文件后，当前镜头的 file input 状态更新会触发整张超长 section 重新渲染。

生产接口数据验证：

- 使用生产 demo 账号真实登录后读取任务和草稿：
  - `GET /api/member/tasks/7765283b-df5e-4946-b8e4-6db11b52ef7b` 返回 200。
  - 任务 `generatedVideoScript.scenes` 数量为 12。
  - `GET /api/content/records/<contentDraftId>` 返回 200。
  - 对应 draft variant 的 `productionScenes` 数量为 12。
  - 镜头 2 的 `voiceover / visual / shotRequirement / materials` 都有内容。
- 因此排除“后端只返回了 2 个镜头”或“镜头 2 数据为空”的判断。

Chromium 复现验证：

- 使用 Playwright Chromium 登录生产站点，打开同一任务并给镜头 1 选择测试 `.mp4`。
- DOM 中仍有 12 个 `[data-video-scene-id]` 前的旧结构对应镜头节点，镜头 2 / 镜头 3 文案可通过 `document.body.innerText` 命中。
- 当前 Chrome/Chromium 下没有复现空白，截图留存：
  - `/tmp/xhs-layout-repro-chromium-current-after-select.png`
- 这说明这次不是 React 崩溃、接口失败或数据丢失，而是布局/浏览器渲染兼容问题。

## 根因判断

核心原因是 dashboard 详情页把原成员端手机页面直接放进桌面 dashboard 的嵌套滚动结构里，又把 12 个镜头连续塞进同一个超长白色 section。

这造成两个风险叠加：

1. 外层 dashboard 有多层 `overflow-hidden`，真正滚动只发生在详情 route wrapper。
2. 内层镜头列表是一个单一超长 section；文件选择后 React 状态更新会让这整张大 section 重新计算和重绘。

在 Chromium 下滚动高度和绘制正常，但用户截图呈现为“后续 DOM 存在、可视区域被白色 section 截断/未重绘”的形态。结合截图和代码结构，判断是嵌套滚动 + 超长单 section + file input 状态更新导致的浏览器绘制/滚动高度兼容问题。

## 实际改动

- `apps/content-growth-platform/src/components/member/member-workspace.tsx`
  - 将“镜头脚本与素材上传”从“一个超长 section + divide-y 列表”拆为：
    - 一个独立的镜头总览 header section。
    - 每个镜头一个独立的可重复卡片 section。
  - 每个镜头卡片增加 `data-video-scene-id`，方便后续浏览器验证和问题定位。
  - 对 `spokenText / subtitle / camera / shootingGuide` 增加前端兜底，避免 Dify 草稿字段缺失时出现只有标题、正文区域像空白的情况。
  - 上传行的文件名区域改为 `min-w-0 flex-1 truncate`，右侧状态改为 `shrink-0`，避免长文件名挤压按钮或撑乱布局。

## 本地验证

已通过：

- `git diff --check`
- `pnpm --dir apps/content-growth-platform typecheck`
- `pnpm --dir apps/content-growth-platform build`
- `pnpm --dir apps/content-growth-platform lint`
  - 仍只有两个既有 warning：
    - `scripts/migrate-factory-source-items-to-merchant-media.mjs` 的 `sourceItem` 未使用。
    - `src/server/api/video-job-payload.ts` 的 `buildMissingVideoAssetHints` 未使用。

本地浏览器数据态验证：

- 本地 dev server：`http://localhost:3002`。
- 使用 demo 表单登录后，`POST /api/auth/merchant-login` 返回 303，但访问任务详情仍被 307 到 `/login?error=unauthenticated&next=/dashboard`。
- 这与此前记录一致：本地库没有可用 demo 登录数据；因此本地只能完成构建和未登录链路验证，不能完成真实任务数据态截图。

WebKit 验证：

- 尝试运行 `python3 -m playwright install webkit` 补装 WebKit。
- 该进程长时间无输出，已终止，未能完成 Safari/WebKit 引擎复测。

## 待线上验证

部署后需要用生产 demo 登录态复测：

1. 打开 `/dashboard/today/video/7765283b-df5e-4946-b8e4-6db11b52ef7b`。
2. 选择镜头 1 的测试视频文件。
3. 确认页面出现 12 个 `[data-video-scene-id]`。
4. 确认镜头 2 文案 `说实话，很多客户看了几十套房还是拿不定主意。` 可见。
5. 确认镜头 3 文案 `问题不在房子本身，而在成交逻辑没搞懂。` 可见。
6. 截图留存部署后的页面状态。

## 未覆盖与风险

1. 当前无法在本机 WebKit/Safari 自动化复现；如果用户实际浏览器是 Safari，仍建议部署后由用户刷新页面再试一次。
2. 本轮只修镜头列表显示结构，不配置 OSS，也不改变 AI 剪辑上传 / 创建任务链路。
3. 如果后续仍出现白屏，需要继续检查真实浏览器 console、文件大小、GPU/内存和是否命中了旧前端缓存。
