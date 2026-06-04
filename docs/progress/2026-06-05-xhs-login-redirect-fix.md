# 2026-06-05 小红书平台登录卡住修复

## 问题

用户反馈访问 `https://xhs.2young.xin/login?demo=1&next=%2Fdashboard` 后，点击登录一直转圈，无法进入工作台。

## 根因

登录接口本身可以成功校验 demo 账号并写入 session，但服务器运行环境里的 `APP_BASE_URL` 仍是旧的直连端口地址：

```text
APP_BASE_URL=http://43.129.207.237:3001
```

因此 `POST /api/auth/merchant-login` 成功后返回：

```text
303 Location: http://43.129.207.237:3001/dashboard
```

而腾讯云防火墙在 SSL 配置后已经关闭公网直连端口 `3001/3003/3004`，浏览器被导向 `http://43.129.207.237:3001/dashboard` 后就会等待到超时，用户侧表现为“登录后一直转圈”。

## 修复

服务器：

- IP：`43.129.207.237`
- 应用目录：`/opt/personal-website/apps/content-growth-platform`
- 环境文件：`.env.production`
- 备份：`.env.production.bak-20260605010223`

修改内容：

```text
APP_BASE_URL=https://xhs.2young.xin
APP_SESSION_SECURE_COOKIE=true
```

然后执行：

```bash
pm2 restart content-growth-platform --update-env
```

## 验证

登录接口公网验证：

```bash
curl -D - -X POST 'https://xhs.2young.xin/api/auth/merchant-login' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'email=demo%40jingjing.local&password=<redacted>&next=%2Fdashboard'
```

修复后关键响应：

```text
HTTP/1.1 303 See Other
location: https://xhs.2young.xin/dashboard
set-cookie: jingjing_session=...; Secure; HttpOnly; SameSite=lax
```

浏览器验证：

- 从 `https://xhs.2young.xin/login?demo=1&next=%2Fdashboard` 点击登录。
- 成功进入 `https://xhs.2young.xin/dashboard/consultation`。
- 页面出现 `内容日历工作台`、`团队选题`、`AI 咨询诊断`。
- 用户确认后续 AI 回复已经输出。

## 备注

1. 页面里曾显示“当前环境没有配置可用的模型密钥”，这是历史会话里的旧失败消息，不是本轮登录根因。
2. 服务器当前 `SILICONFLOW_API_KEY` 已有值；平台设置中 `llm_runtime.primaryModel` 与咨询 agent model 均为 `deepseek-ai/DeepSeek-V4-Flash`，fallback 为 `Qwen/Qwen3-32B`。
3. PM2 error log 里仍有旧的 `next start -- -p 3001 -H 0.0.0.0` 启动参数错误记录，但当前进程已在线；本轮没有发现新的登录错误。

