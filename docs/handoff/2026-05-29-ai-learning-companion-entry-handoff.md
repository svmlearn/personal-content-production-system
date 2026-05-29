# AI 智能学习伴侣真实入口 Handoff

日期：2026-05-29
实现分支：`work/ai-learning-companion-entry`
实现 worktree：`/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/ai-learning-companion-entry`
合并目标：`main`
状态：已实现，已合并 `main`

## 当前目标

让作品集里的「AI 智能学习伴侣」像小红书项目一样，有下一层可进入的前端项目入口。

## 已完成内容

1. 新增 `apps/ai-learning-companion/` 独立 Next.js 前端应用。
2. 从旧项目只复制必要素材：
   - 高老师帧图 `gao-frame-0.png` 到 `gao-frame-5.png`
   - 今日运势表情 `mood-laugh.svg`、`mood-smile.svg`、`mood-calm.svg`
3. 实现用户端展示体验：
   - 高老师形象
   - 今日运势
   - 对话
   - 鬼点子投骰
   - 心迹长期记忆
4. 修改作品集 `LEARN-AI` 详情，增加「进入该项目」入口。
5. 新增根脚本：
   - `pnpm dev:ai-learning`
   - `pnpm lint:ai-learning`
   - `pnpm build:ai-learning`
6. 写入进度记录：
   - `docs/progress/2026-05-29-ai-learning-companion-entry.md`

## 没有迁移的内容

没有迁移旧项目的后端、登录、数据库、硬件服务、设备绑定、语音 WebSocket、模型 API、环境变量和密钥。

当前应用是「作品集可进入的用户端前端展示体验」，不是旧项目完整系统迁移。

## 运行方式

```bash
pnpm dev:ai-learning
```

访问：

```text
http://localhost:3003
```

选择 `3003` 的原因：本机 `3002` 当时被另一个内容平台 dev server 占用。

## 验证结果

已通过：

```bash
pnpm lint:ai-learning
pnpm build:ai-learning
```

浏览器验证：

1. 桌面端加载成功。
2. 移动端 `390x844` 加载成功。
3. 高老师图片和今日运势图片加载成功。
4. 对话、鬼点子、心迹三个 tab 可交互。
5. 浏览器 console 无 error。

## 改动文件

主要新增：

1. `apps/ai-learning-companion/**`
2. `docs/progress/2026-05-29-ai-learning-companion-entry.md`

主要修改：

1. `apps/portfolio/script.js`
2. `apps/portfolio/index.html`
3. `package.json`
4. `pnpm-lock.yaml`

## 提交 / 合并状态

实现提交：`ad4b45d Add AI learning companion app entry`

已通过 merge commit 合并到 `main`。后续如需继续迭代，可直接从当前 `main` 新开分支。
