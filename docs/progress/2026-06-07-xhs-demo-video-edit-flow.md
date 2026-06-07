# 2026-06-07 XHS Demo 视频剪辑链路修复

## 问题原貌

用户在生产 demo 链路的视频任务详情页选择素材后点击 `AI 剪辑`，页面仍出现红色错误：

> 视频素材上传服务暂未配置好，当前不能完成 AI 剪辑。已选择的视频不会丢失，请稍后再试或联系管理员配置素材存储。

截图位置：

- 页面模块：今日内容 / 视频脚本详情 / AI 剪辑
- 触发动作：已选择 2 段素材后点击 `AI 剪辑`

用户指出当前是 demo 演示链路，不应展示这种需要管理员配置素材存储的生产配置错误。

## 根因判断

当前成员端视频详情页虽然已经作为 demo 工作台入口使用，但 `AI 剪辑` 按钮仍走真实生产链路：

1. `startAiEdit`
2. `uploadDraftMediaFile`
3. `POST /api/media/upload-intents`
4. 依赖 Aliyun OSS 上传配置
5. 上传成功后再创建真实 `video_edit_jobs`

服务器当前没有配置 OSS 上传闭环，因此 `/api/media/upload-intents` 抛出存储配置错误；前端 `formatMemberVideoActionError` 将其转成“视频素材上传服务暂未配置好”的红色提示。

这与当前 PRD 和 progress 中的演示边界不一致：

- `docs/产品文档/2026-06-05-小红书今日内容主链路收口PRD.md`
  - 本阶段 `AI 一键剪辑` 是面试演示闭环。
  - 不要求真实调用 video-worker。
  - 不要求真实上传 OSS。
  - 需要清晰 demo flag / 本地状态命名，避免误判为生产真实剪辑。
- `docs/progress/2026-06-06-content-generation-worker-pm2.md`
  - 若目标是面试演示，优先做 `demo flag + public 预置 MP4` 的视频剪辑演示闭环。
  - 不改真实上传 API，不写真实 `video_edit_jobs`，不替换 storage provider。

因此本轮问题不是“错误文案不够友好”，而是 demo 演示入口误走真实素材上传链路。

## 实际改动

- `apps/content-growth-platform/src/components/member/member-workspace.tsx`
  - 新增明确 demo flag：
    - `memberVideoDemoEditEnabled`
    - 默认开启，可通过 `NEXT_PUBLIC_MEMBER_VIDEO_DEMO_EDIT_ENABLED=false` 关闭。
  - 点击 `AI 剪辑` 时，若 demo flag 开启：
    - 不调用 `uploadDraftMediaFile`
    - 不调用 `/api/media/upload-intents`
    - 不调用 `createVideoEditJob`
    - 不写真实 `video_edit_jobs`
  - 改为前端本地 demo 状态机：
    - `local_demo_pending_worker`
    - `local_demo_preparing_inputs`
    - `local_demo_material_match`
    - `local_demo_voiceover`
    - `local_demo_timeline`
    - `local_demo_rendering`
    - `local_demo_saving_result`
    - `local_demo_completed`
  - 复用现有 `AiEditProgressStatus` 组件展示：
    - 素材准备
    - 素材匹配
    - 配音生成
    - 字幕与时间线
    - 合成渲染
    - 保存成片
  - 完成后生成前端 demo job，并展示本地静态成片。
- `apps/content-growth-platform/src/lib/ui/video-job-display.ts`
  - 补齐 local demo 阶段中文展示。
- `apps/content-growth-platform/public/demo/member-video-final.mp4`
  - 新增轻量 demo 成片资源。

## 本地验证

已通过：

- `git diff --check`
- `pnpm --dir apps/content-growth-platform typecheck`
- `pnpm --dir apps/content-growth-platform lint`
  - 仍只有两个既有 warning：
    - `scripts/migrate-factory-source-items-to-merchant-media.mjs` 的 `sourceItem` 未使用。
    - `src/server/api/video-job-payload.ts` 的 `buildMissingVideoAssetHints` 未使用。
- `pnpm --dir apps/content-growth-platform build`

静态资源：

- `apps/content-growth-platform/public/demo/member-video-final.mp4`
- 大小约 `85KB`
- H.264 / AAC MP4，可由浏览器 video 标签播放。

## 待线上验证

部署后使用生产 demo 账号复测：

1. 打开今日视频任务详情。
2. 选择 2 段素材。
3. 点击 `AI 剪辑`。
4. 预期：
   - 不再出现“视频素材上传服务暂未配置好”。
   - Network 中不应调用 `/api/media/upload-intents`。
   - 页面展示 demo 进度模块。
   - 约 5 秒后展示 `/demo/member-video-final.mp4` 成片预览与下载入口。

## 未覆盖与风险

1. 本轮只修 demo 演示链路，不实现真实 OSS 上传和真实 video-worker 成片。
2. 若未来切换到真实生产剪辑，需要显式设置 `NEXT_PUBLIC_MEMBER_VIDEO_DEMO_EDIT_ENABLED=false`，并完成 Aliyun OSS / worker 配置。
3. 声音克隆上传仍是生产链路；demo flag 下点击 `AI 剪辑` 不会上传声音文件。
