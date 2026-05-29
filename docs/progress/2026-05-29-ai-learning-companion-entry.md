# AI 智能学习伴侣作品集真实入口进度记录

日期：2026-05-29
实现分支：`work/ai-learning-companion-entry`
实现 worktree：`/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/ai-learning-companion-entry`
合并目标：`main`
状态：已实现，已合并 `main`

## 1. 本轮目标

把作品集里的「AI 智能学习伴侣」从纯文字项目，升级为一个可以从作品集详情层进入的前端展示应用。

用户要求：

1. 参考旧项目里的普通用户端，不要整仓搬迁。
2. 新应用放到当前仓库 `apps/` 下，架构上类似 `apps/content-growth-platform` 是独立项目。
3. 可以拿旧项目中的图片素材，尤其是「今日运势」表情和「高老师」形象。
4. 只需要前端展示体验，不迁移完整后端、硬件链路、管理端、密钥和数据库。
5. 使用 subagent 做实现，主 Agent 最后 review。

## 2. 参考来源

旧项目只读参考路径：

`/Users/wy/Desktop/个人IP/炒饭会/AI硬件小礼物/AI智能硬件项目软件部分代码/gao-agent-gitee/wayne/apps/manager-web`

重点参考：

1. `app/user/page.tsx`
2. `app/user/login/page.tsx`
3. `app/user/profile/page.tsx`
4. `app/user/_components/user-portal-primitives.tsx`
5. `public/gift/gao-frame-0.png` 到 `gao-frame-5.png`
6. `public/gift/mood-laugh.svg`
7. `public/gift/mood-smile.svg`
8. `public/gift/mood-calm.svg`

## 3. 实际实现

新增独立应用：

`apps/ai-learning-companion/`

技术形态：

1. Next.js `16.2.4`
2. React `19.2.4`
3. TypeScript
4. lucide-react
5. 原生 CSS，不引入 Tailwind / shadcn / 旧项目 UI 组件

实现内容：

1. 首屏直接进入用户端界面，不做营销落地页。
2. 左侧 / 移动端顶部保留「高老师」形象和语音通话按钮。
3. 保留「今日运势」面板，使用旧项目表情素材。
4. 主区域提供三个 tab：
   - `对话`
   - `鬼点子`
   - `心迹`
5. `对话` 为本地前端状态交互，根据输入关键词返回示例回复，不接真实模型 API。
6. `鬼点子` 为本地投骰互动，保留签文和骰子体验。
7. `心迹` 为本地长期记忆展示和新增 / 删除交互。
8. 桌面和移动端都做了响应式压缩，避免首屏只像封面。

作品集入口修改：

1. `apps/portfolio/script.js`
   - 给 `LEARN-AI` 项目详情增加 `launch`。
   - 当前本地端口设为 `3003`。
2. `apps/portfolio/index.html`
   - 更新脚本版本号，避免静态缓存沿用旧 `script.js`。

根目录脚本补充：

1. `pnpm dev:ai-learning`
2. `pnpm lint:ai-learning`
3. `pnpm build:ai-learning`

## 4. 为什么使用 3003

最初计划使用 `3002`，但本机当时已有进程占用：

`/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/content-light-ui/apps/content-growth-platform`

占用进程是 Next.js dev server，端口为 `3002`。

为避免打断正在运行的内容平台预览，本轮将 AI 智能学习伴侣本地入口定为：

`http://localhost:3003`

作品集详情页的 launch 也同步指向 `3003`。

## 5. 没有迁移的内容

本轮明确没有迁移：

1. 旧项目整仓。
2. 管理端。
3. 用户登录和账号体系。
4. 真实对话 API。
5. 语音 WebSocket。
6. 设备绑定 / 解绑。
7. ESP32 / 小智硬件服务。
8. 数据库。
9. 环境变量和密钥。
10. 旧项目的后端服务、测试、部署脚本。

因此当前应用应被理解为：

> 作品集内可进入的用户端前端展示体验，而不是旧项目完整系统迁移。

## 6. Subagent 执行情况

本轮按用户要求启用了 implementer subagent。

subagent 实际完成：

1. 复制了 `apps/ai-learning-companion/public/gift/` 下的高老师和运势素材。

subagent 口头返回称已经写入页面骨架和作品集入口，但主 Agent review 时发现：

1. `apps/ai-learning-companion` 下只有素材文件。
2. `app/page.tsx`、`package.json`、`next.config.ts` 等代码文件实际未落盘。
3. `apps/portfolio/script.js` 和 `apps/portfolio/index.html` 也没有对应改动。

后续由主 Agent 接手完成实际实现，并保留了素材复制结果。

## 7. 验证结果

依赖安装：

```bash
cd apps/ai-learning-companion
pnpm install
```

结果：成功。安装过程中 npm registry 对若干包响应较慢，但最终完成。

构建验证：

```bash
pnpm build:ai-learning
```

结果：通过。

关键结论：

1. Next.js `16.2.4` 编译成功。
2. TypeScript 检查通过。
3. `/` 和 `/_not-found` 静态生成成功。

Lint 验证：

```bash
pnpm lint:ai-learning
```

结果：通过。最初有 `<img>` 警告，已改为 `next/image` 后清零。

浏览器验证：

1. 本地启动：`pnpm dev:ai-learning`
2. 访问：`http://localhost:3003`
3. 桌面视口验证：
   - 页面可加载。
   - 高老师图片可显示。
   - 今日运势图标可显示。
   - 无浏览器 console error。
4. 交互验证：
   - 对话输入后可追加用户消息和本地示例回复。
   - 鬼点子 tab 可投骰，并切换为「再投一次」。
   - 心迹 tab 可新增一条本地记忆。
   - 无浏览器 console error。
5. 移动视口 `390x844` 验证：
   - 页面可加载。
   - 高老师、今日运势、tab 和首条对话均可见。
   - 移动端无 console error。

## 8. 风险与后续

已知边界：

1. 当前对话不是大模型真实链路。
2. 当前语音通话按钮只触发高老师动效，不接麦克风和 WebSocket。
3. 当前心迹只存在于前端状态，刷新后恢复示例数据。
4. 当前鬼点子投骰只在本地生成，不消费旧系统的每日次数。

如果未来要升级为真实服务，应单独开任务：

1. 明确是否从旧项目迁移后端 API。
2. 明确账号体系是否保留。
3. 明确真实模型和语音链路接哪个 runtime。
4. 明确硬件设备绑定是否要进入作品集展示范围。

不要在没有这些决策前，把当前前端展示体验说成完整旧系统迁移。
