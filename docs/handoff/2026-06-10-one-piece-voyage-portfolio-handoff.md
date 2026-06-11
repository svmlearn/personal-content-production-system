# One Piece Voyage Portfolio Handoff

日期：2026-06-10

## 当前目标

把 `apps/portfolio/` 个人网站首页先对齐 Stitch 的 One Piece Web Voyage 设计稿，优先按用户指定设计稿还原视觉，不保留原作品集风格。

## Worktree / Branch

- Worktree: `/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/one-piece-voyage-portfolio`
- Branch: `codex/one-piece-voyage-portfolio`
- 本轮未 merge，未 push，未 commit。

## 已完成

- 将首页主体替换为 Stitch 导出的航海主题页面结构。
- 使用本地设计图作为 hero 背景：`apps/portfolio/assets/images/stitch-voyage-hero.png`。
- 移除 hero 背景的糊化蒙版：不再使用 `opacity-60 mix-blend-multiply`。
- hero 图片裁切锚点改为 `object-top`，避免宽屏下把帆面顶部文字裁掉。
- 删除 Stitch Three.js 白色矩形动画代码；该动画导出质量不满足用户要求。
- 按用户提供的五张图参考稿还原 Wanted Bounties 的错落海报排布和 hover 文案。
- 按用户最新要求删除底部 `Explore the Grand Line` 地图 / 指南针卡片。
- 使用 `voyage-long-background-posters-gull.png` 替换首页长背景图。
- 删除深蓝 footer、红色 footer 分割线和 `© 1524 Grand Line - Yang Labs. All Rights Reserved.`。
- 鼠标保留小船光标，但移除航海轨迹和延迟跟随动画。
- 五张海报 hover 文案改为真实项目：智蛙 AI 面试、AI 智能学习伴侣、内容获客平台、FDE 企业 AI、Agent Harness。`KeploreAI PMF` 暂不放入 5 张海报。
- 五张海报的 `View Project` 已改为真实链接：智蛙站内页、`learn.2young.xin`、`xhs.2young.xin` demo 登录、`fde.2young.xin`、`https://github.com/svmlearn/codex-agent-harness`。
- 顶部导航改为中文居中：`首页 / 项目`；删除 `Treasures / Crew`；右侧 CTA 改为 `联系我` 的 mailto 链接。
- 删除 `Wanted Bounties` 大横幅标题；移动端底部导航同步精简为 `首页 / 项目 / 联系`。
- 清理小船鼠标脚本中残留的航线轨迹函数，避免后续误触发拖尾。

## 改动文件

- `apps/portfolio/index.html`
- `apps/portfolio/assets/images/stitch-voyage-hero.png`
- `apps/portfolio/assets/images/voyage-long-background.png`
- `apps/portfolio/assets/images/voyage-long-background-posters-gull.png`

## 本地服务

当前静态服务已启动：

- `http://localhost:8097/`
- 启动目录：`apps/portfolio`

## 验证结果

- 通过 `web-access` CDP Proxy 打开 `http://127.0.0.1:8097/` 截图确认：桌面导航为 `首页 / 项目`，CTA 为 `联系我`，旧英文导航和 `Wanted Bounties` 正文残留为 false。
- `curl -sS http://127.0.0.1:8097/` 输出确认：
  - hero 使用 `stitch-voyage-hero.png`
  - hero class 为 `object-cover object-top`
  - 页面中已无 `Explore the Grand Line`
  - 页面中已无 `Hover over the map`
  - 页面中已无 `Vintage nautical map compass`
  - 页面中仍有 5 个 `poster-hover-layer`
- 用 Chrome 调试端口打开 `http://127.0.0.1:8097/` 截图确认：
  - hero 顶部文字不再被页面裁切。
  - Wanted Bounties 海报区按参考稿错落展示。

## 注意

- 当前海报和 logo 仍引用 Stitch 导出的远程 `lh3.googleusercontent.com/aida-public/...` 图片地址。
- hero 背景图已本地化；其他远程图后续如需稳定部署，建议继续下载并改成本地资产。
