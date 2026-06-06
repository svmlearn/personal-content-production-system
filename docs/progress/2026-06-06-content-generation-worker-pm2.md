# 2026-06-06 content-generation worker PM2 常驻部署记录

## 范围

将已有 `apps/content-growth-platform/scripts/content-generation-worker.mjs` 从手动 run-once 验证方式，切换为服务器 PM2 常驻进程，确保用户点击 `生成团队本周内容` 后，后台 worker 会自动捡取 pending job 并调用 Dify 写回今日内容。

## 结论

已完成。

`content-generation-worker` 已作为 PM2 常驻进程在线运行，并已通过远期测试 batch 验证会自动捡取任务，不需要手动执行 run-once。

## 代码改动

提交：

- `83f5739 chore: add content generation worker production runner`

改动文件：

- `apps/content-growth-platform/scripts/start-content-generation-worker-production.mjs`
- `apps/content-growth-platform/package.json`

新增 production runner 的原因：

- 现有 worker 代码本身已经支持 loop 模式。
- 服务器 `.env.production` 不能直接用 shell `source`，因为历史 env 值中有包含空格的未加引号内容，曾导致 `source .env.production` 执行失败。
- runner 用 Node 安全解析 `.env.production`，再启动现有 `content-generation-worker.mjs`。
- runner 默认把 worker 的 `APP_BASE_URL` 指向 `http://127.0.0.1:3001`，避免 worker 经公网域名绕一圈访问本机应用。
- runner 删除 `CONTENT_GENERATION_WORKER_RUN_ONCE`，确保 PM2 常驻时使用 loop 模式。

## 本地验证

通过：

```bash
node --check apps/content-growth-platform/scripts/start-content-generation-worker-production.mjs
git diff --check
pnpm --dir apps/content-growth-platform lint
pnpm --dir apps/content-growth-platform build
```

lint 仍有 2 个既有 warning：

- `scripts/migrate-factory-source-items-to-merchant-media.mjs` 的 `sourceItem` 未使用
- `src/server/api/video-job-payload.ts` 的 `buildMissingVideoAssetHints` 未使用

## 服务器部署

服务器：

- IP：`43.129.207.237`
- repo：`/opt/personal-website`
- app：`/opt/personal-website/apps/content-growth-platform`

部署动作：

1. 服务器 fast-forward 到 `83f5739`
2. 执行 `pnpm --dir apps/content-growth-platform build`
3. 新增 PM2 进程：

```bash
pm2 start scripts/start-content-generation-worker-production.mjs \
  --name content-generation-worker \
  --interpreter node \
  --time
```

4. 执行 `pm2 save`

服务器 build 通过。

PM2 状态：

- `content-generation-worker`：online
- PM2 id：`3`
- pid：`619099`
- mode：`fork`
- restart count：`0`
- process list 已保存到 `/home/ubuntu/.pm2/dump.pm2`

## 自动捡任务验证

验证方式：

- 不手动调用 `/api/content-generation/jobs/run-next`
- 不手动 run-once
- 只创建一个远期测试 batch
- 等 PM2 常驻 worker 自动轮询并处理

测试 batch：

- 测试日期：`2026-08-03`
- `memberScope=self`
- `days=1`
- `extraRequirement=codex-pm2-worker-auto-20260606-1358`
- batch id：`fd0fb7a1-df0b-4d88-99f9-b6a408052e52`
- job id：`1aa803af-6383-49e0-b4f2-149642df87fe`
- daily task id：`445a841a-655f-49ae-a144-8faf3d39dd5e`

轮询观察：

- 初始：`pending / queued`
- 约 15 秒后：`running / calling_dify`
- 结束：`succeeded / persisted`

最终结果：

- elapsed：`315229ms`
- `difyWorkflowRunId=d1e28440-2adb-4d76-9538-7dc0681cf2b5`
- `contentDraftId=64b7262b-e629-400e-adcf-ce42ba0fc541`
- article generation status：`succeeded`
- video generation status：`succeeded`
- article title：`都说配套要等，这个盘已经成熟了`
- video title：`今日视频：真人口播讲项目机会 · 低总价上车`
- video scene count：`16`

PM2 worker 日志关键记录：

```text
content_generation_worker_started mode=loop appBaseUrl=http://127.0.0.1:3001
content_generation_worker_idle processed=false
content_generation_job_processed processed=true jobId=1aa803af-6383-49e0-b4f2-149642df87fe status=succeeded currentStage=persisted elapsedMs=294329
content_generation_worker_idle processed=false
```

判断：

- PM2 常驻 worker 已自动捡取并处理 pending job。
- `团队选题 / 生成团队本周内容 -> pending job -> worker 自动调用 Dify -> 写回今日内容` 已具备自动后台处理能力。
- 远期测试数据暂未清理，保留用于后续检查成功样本。

## OSS / 视频剪辑边界

本轮没有配置 OSS，也没有实现视频剪辑成片闭环。

如果只做 PRD 中的演示级 `AI 剪辑 -> 成片`：

- 可以使用 demo flag + 前端状态机 + `public/demo/*.mp4` 预置成片。
- 这种方式不需要 OSS。
- 只要实现时不改真实上传 API、不写真实 `video_edit_jobs`、不替换 storage provider，就不会破坏未来接入真实 OSS / video-worker 的链路。

如果要保留真实素材上传链路：

- 当前代码契约要求 `STORAGE_PROVIDER=aliyun_oss`。
- 新上传不支持腾讯 COS。
- 要配置 Aliyun OSS bucket、RAM access key、CORS 和 `PRIVATE_MEDIA_DOWNLOAD_TOKEN_SECRET`。

建议下一步：

1. 若目标是面试演示，优先做 demo flag + public 预置 MP4 的视频剪辑演示闭环。
2. 若目标是生产级素材上传和真实 worker，再单独配置 Aliyun OSS。

