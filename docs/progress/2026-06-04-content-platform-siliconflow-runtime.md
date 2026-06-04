# 2026-06-04 小红书内容平台 SiliconFlow AI Runtime 配置记录

## 背景

腾讯云轻量服务器上的 `content-growth-platform` 已部署并能登录，但 AI 对话链路缺少模型 API key。

用户提供 SiliconFlow OpenAI-compatible runtime：

- Base URL: `https://api.siliconflow.cn/v1`
- Primary model: `deepseek-ai/DeepSeek-V4-Flash`
- Fallback model: `Qwen/Qwen3-32B`
- API key: 已写入环境变量，本文档不记录明文。

本次目标是让小红书 / 内容获客平台的 AI 咨询对话可用，并将默认对话模型切到 DeepSeek；不处理 OSS / COS 文件存储。

## 结论

AI 对话已经打通。

OSS/COS 当前仍未配置，不影响基础 AI 咨询对话；它主要影响：

- 素材上传
- 私有素材预览 / 下载
- 知识文件上传
- 视频 worker 输入 / 输出资产
- `/api/health` 的 storage 子项

## 配置动作

本地：

- 更新 `apps/content-growth-platform/.env.local`
- 新增 / 更新 `SILICONFLOW_API_KEY`
- `.env.local` 未提交 Git

服务器：

- 更新 `/opt/personal-website/apps/content-growth-platform/.env.production`
- 新增 / 更新 `SILICONFLOW_API_KEY`
- 未记录明文 key
- 执行 `pm2 restart content-growth-platform --update-env`
- 只重启 `content-growth-platform`，未重启 `ai-learning-companion` 或 `fde-ai-empowerment`

数据库设置：

- 更新 `platform_settings.llm_runtime`
  - `providerLabel=SiliconFlow`
  - `baseUrl=https://api.siliconflow.cn/v1`
  - `primaryModel=deepseek-ai/DeepSeek-V4-Flash`
  - `fallbackModel=Qwen/Qwen3-32B`
  - `timeoutSeconds=60`
- 更新 `platform_settings.consultation_agent`
  - `model=deepseek-ai/DeepSeek-V4-Flash`

## 运行时判断

代码读取 key 的优先级在 `apps/content-growth-platform/src/server/api/ai-runtime.ts`：

1. `SILICONFLOW_API_KEY`
2. `LLM_API_KEY`
3. `OPENAI_API_KEY`

服务器原状态：

- `SILICONFLOW_API_KEY=<empty>`
- `LLM_API_KEY=<empty>`
- `OPENAI_API_KEY=<empty>`

数据库中 `platform_settings.llm_runtime` 仍保留历史 OpenAI-compatible 配置：

- `baseUrl=https://api.openai.com/v1`
- `primaryModel=gpt-4.1`
- `fallbackModel=gpt-4.1-mini`

如果数据库仍是历史 OpenAI 配置，代码在 `SILICONFLOW_API_KEY` 存在且 key source 不是 `openai` 时，会把 legacy OpenAI runtime 回落到 SiliconFlow 默认：

- `providerLabel=SiliconFlow`
- `baseUrl=https://api.siliconflow.cn/v1`
- `primaryModel=Qwen/Qwen3-32B`
- `fallbackModel=Qwen/Qwen3-14B`

同理，咨询 agent / knowledge runtime 里的 legacy OpenAI model 会回落到项目默认 Qwen model。

但本次已显式更新数据库设置，所以当前默认对话模型不是回落的 Qwen，而是：

- `consultation_agent.model=deepseek-ai/DeepSeek-V4-Flash`
- `llm_runtime.primaryModel=deepseek-ai/DeepSeek-V4-Flash`
- `llm_runtime.fallbackModel=Qwen/Qwen3-32B`

## 验证结果

### 1. SiliconFlow 直连验证

在服务器读取 `.env.production` 中的 `SILICONFLOW_API_KEY`，直接请求：

- `POST https://api.siliconflow.cn/v1/chat/completions`
- model: `Qwen/Qwen3-32B`

结果：

- HTTP `200`
- response model: `Qwen/Qwen3-32B`
- content: `正常`

随后验证 DeepSeek 主模型：

- model: `deepseek-ai/DeepSeek-V4-Flash`
- HTTP `200`
- response model: `deepseek-ai/DeepSeek-V4-Flash`
- content: `正常`

### 2. 应用咨询链路验证

通过公网应用接口：

1. `POST /api/auth/merchant-login`
2. `POST /api/consultation/sessions`
3. `POST /api/consultation/sessions/:sessionId/messages`
4. 轮询 `GET /api/consultation/sessions/:sessionId`

结果：

- login: `303`
- session create: `201`
- message post: `202 queued`
- assistant reply persisted: `硅基流动已经接入。`
- `consultation_events` 中出现 `llm.response.completed`
- event model: `Qwen/Qwen3-32B`

测试 session 已删除，避免污染 demo 界面。

切换默认模型到 DeepSeek 后，再次通过应用接口验证：

- message post: `202 queued`
- assistant reply persisted: `DeepSeek 已经成为默认模型。`
- `consultation_events` 中出现 `llm.response.completed`
- event model: `deepseek-ai/DeepSeek-V4-Flash`

第二个测试 session 也已删除，避免污染 demo 界面。

## OSS/COS 当前状态

`GET /api/health` 结果：

- app: `ok`
- database: `ok`
- storage: `error`
- provider: `aliyun_oss`
- message: `Aliyun OSS environment variables are not configured.`

这说明当前系统仍按 `STORAGE_PROVIDER=aliyun_oss` 走对象存储检查，但缺少 Aliyun OSS bucket / endpoint / access key。

短期建议：

- 如果只演示 AI 咨询对话，可以暂不配置 OSS/COS。
- 如果要启用素材上传、知识文件上传、私有媒体下载或视频 worker，再单独配置对象存储。
- 当前代码主线只实现 `aliyun_oss` provider。若要切到腾讯 COS，不是只改环境变量，需要新增 COS provider、扩展 storage provider union、API schema、脚本和测试契约。

## 未做事项

- 未配置 Aliyun OSS。
- 未迁移到腾讯 COS。
- 未启动视频 worker。
- 未把任何 secret 写入 Git。
- 未提交 `.env.local` 或 `.env.production`。
