# 2026-06-06 XHS 今日图文图片位置与视频上传白屏排查

## 问题原貌

用户反馈两个问题：

1. 今日图文详情页的“已匹配图片”位置不对，应该放在顶部任务说明和“已生成文案”之间，也就是截图中间的位置。
2. 今日视频脚本页尝试选择 / 上传两个视频后出现白屏。

## 取证与判断

图文页：

- 当前实现顺序是：顶部任务说明 → 已生成文案 → 一键改写 → 已匹配图片。
- 用户期望是：顶部任务说明 → 已匹配图片 → 已生成文案 → 一键改写。

视频页：

- 使用生产 demo 登录态和 Playwright 复现：
  - 打开 `https://xhs.2young.xin/dashboard/today/video/7765283b-df5e-4946-b8e4-6db11b52ef7b`。
  - 给前两个视频 file input 选择两个本地测试 `.mp4` 文件。
  - 仅选择文件时，页面没有 `pageerror`，console 没有错误，文件名能显示。
  - 点击 `AI 剪辑` 后，`/api/media/upload-intents` 返回 `503`。
  - 页面没有真正崩溃，但错误提示在 AI 剪辑区域底部；如果视口或滚动位置不合适，容易表现成大片空白 / 白屏感。
- PM2 日志未发现本次上传导致服务端崩溃。日志里有历史 `Failed to find Server Action "x"`，判断更像部署切换期间旧客户端请求，不是本次视频上传 API 直接抛出的异常。
- 上传失败的真实原因仍是历史已记录边界：当前服务器没有配置 Aliyun OSS 上传环境变量，因此素材上传接口会返回 503。

## 根因判断

1. 图文图片区是纯 UI 顺序问题。
2. 视频页有两个产品 / 前端状态问题：
   - `startAiEdit()` 在确认脚本版本后立即 `setScriptVariant(approvedVariant)`，然后才开始上传素材。若上传失败，页面已经从今日脚本切换到草稿版本解析结果，导致内容突然变化。
   - 上传失败提示只出现在底部 AI 剪辑模块内，且 OSS 原始英文错误对用户不可读。

## 实际改动

- `apps/content-growth-platform/src/components/member/member-workspace.tsx`
  - 将“已匹配图片”移动到顶部任务说明之后、“已生成文案”之前。
  - 视频素材选择后显示 `已选择` 和文件大小。
  - 选择新视频素材时清除旧错误。
  - `AI 剪辑` 创建成功后才 `setScriptVariant(approvedVariant)`；上传失败时保持原脚本页面稳定。
  - 视频上传 / 剪辑错误在视频页上方也显示一份明确提示，避免用户只看到底部空白或状态突变。
  - 将 OSS / upload-intents 失败转换成中文提示：素材上传服务暂未配置好，当前不能完成 AI 剪辑。

## 验证计划

本地已跑：

- `git diff --check`
- `pnpm --dir apps/content-growth-platform typecheck`
- `pnpm --dir apps/content-growth-platform build`
- `pnpm --dir apps/content-growth-platform lint`
  - 仍只有两个既有 warning：
    - `scripts/migrate-factory-source-items-to-merchant-media.mjs` 的 `sourceItem` 未使用。
    - `src/server/api/video-job-payload.ts` 的 `buildMissingVideoAssetHints` 未使用。

部署后需要复测：

1. 图文详情页“已匹配图片”是否在顶部任务说明和“已生成文案”之间。
2. 视频详情页选择两个视频后是否仍正常显示文件名 / 大小。
3. 点击 `AI 剪辑` 后，在 OSS 未配置的当前环境下应显示中文错误，不应白屏，不应切换脚本内容。

## 线上验证结果

代码 commit：

- `bde583f fix: stabilize today media upload detail views`

服务器部署：

- 服务器 `/opt/personal-website` 已 fast-forward 到 `bde583f`。
- `pnpm --dir apps/content-growth-platform build` 通过。
- PM2 `content-growth-platform` 已重启并保持 `online`，当时 pid 为 `716478`。

Playwright 线上复测：

- 图文详情页：
  - `已匹配图片` 在 DOM 文本中的位置早于 `已生成文案`，顺序符合预期。
  - 截图留存：`/tmp/xhs-article-image-order.png`。
- 视频详情页：
  - 选择两个本地测试 `.mp4` 文件后，页面仍显示 `镜头脚本与素材上传`。
  - 两个文件名均显示，且出现 `已选择` 状态。
  - 点击 `AI 剪辑` 后，页面无 `pageerror`。
  - `/api/media/upload-intents` 按当前环境返回 `503`。
  - 页面显示中文错误 `视频素材上传服务暂未配置好...`。
  - 页面没有再出现提前切换脚本版本的现象；验证项 `after_click_no_variant_script_jump=true`。
  - 截图留存：`/tmp/xhs-video-upload-error-fixed.png`。

## 未覆盖与风险

1. 本轮没有配置 OSS，因此不能验证真实视频素材上传成功和 AI 剪辑成片。
2. 若用户遇到的“白屏”来自浏览器内存、真实大文件、旧前端资源缓存或部署切换期间的 stale client，本轮修复能降低状态突变和错误不可见问题，但仍需要用户刷新后再试一次确认。
3. 后续要让 AI 剪辑真实可用，仍需配置 Aliyun OSS bucket、RAM key、CORS 和相关 `.env.production`。
