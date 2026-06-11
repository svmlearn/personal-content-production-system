# One Piece Voyage Portfolio - Next Context Handoff

日期：2026-06-11

## 当前任务

继续改造个人网站首页 `/apps/portfolio/`，目标是把当前页面从原个人作品集风格改成 One Piece / Grand Line 航海主题，并优先服务作品集项目展示。

用户当前最新方向不是继续照抄静态设计稿，而是把 `docs/DESIGNS/参考交互视频1.mp4` 到 `参考交互视频4.mp4` 里的交互机制筛选后嫁接到现有首页。

## Worktree / Branch

- Worktree: `/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/one-piece-voyage-portfolio`
- Branch: `codex/one-piece-voyage-portfolio`
- 不要直接在主工作区大改。
- 当前未 merge、未 push、未 commit。

## 当前页面状态

- 入口文件：`/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/one-piece-voyage-portfolio/apps/portfolio/index.html`
- 本地服务：`http://localhost:8097/`
- 静态服务命令：

```bash
python3 -m http.server 8097 -d apps/portfolio
```

- 当前首页使用长图背景：
  - `/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/one-piece-voyage-portfolio/apps/portfolio/assets/images/voyage-long-background-posters-gull.png`
- 顶部导航已改成中文：
  - `首页`
  - `项目`
  - 右侧 CTA：`联系我`，链接 `mailto:ywangyangw@163.com`
- 已删除：
  - `Treasures`
  - `Crew`
  - `Set Sail`
  - `Wanted Bounties` 大横幅标题
  - 旧深蓝 footer 和 `© 1524 Grand Line - Yang Labs. All Rights Reserved.`
  - 鼠标航线轨迹
- 当前保留：
  - 小船鼠标指针
  - 5 张悬赏海报
  - hover 后显示项目说明和 `View Project`

## 当前 5 个项目与链接

1. 智蛙 AI 面试
   - 链接：`./projects/zhiwa-ai-interview/index.html`
2. AI 学习伴侣
   - 链接：`https://learn.2young.xin/`
3. 内容获客平台
   - 链接：`https://xhs.2young.xin/login?demo=1&next=%2Fdashboard`
4. FDE 企业 AI
   - 链接：`https://fde.2young.xin/`
5. Agent Harness
   - 链接：`https://github.com/svmlearn/codex-agent-harness`

`KeploreAI PMF / CapsuleAI PMF` 当前暂不放入 5 张海报，因为项目有 6 个但海报只有 5 张，用户已接受先不放。

## 最新交互视频判断

参考文件位置：

- `/Users/wy/Desktop/个人IP/个人网站搭建/docs/DESIGNS/参考交互视频1.mp4`
- `/Users/wy/Desktop/个人IP/个人网站搭建/docs/DESIGNS/参考交互视频2.mp4`
- `/Users/wy/Desktop/个人IP/个人网站搭建/docs/DESIGNS/参考交互视频3.mp4`
- `/Users/wy/Desktop/个人IP/个人网站搭建/docs/DESIGNS/参考交互视频4.mp4`

已看过并给出的判断：

1. 视频 3 最适合优先落地到悬赏海报区。
   - 用户的意图是借鉴“物品移动的轮播效果”。
   - 建议把现在 5 张散开的海报改成“中间主海报 + 两侧半露海报 + 点击/滚轮/键盘切换”的悬赏令轮播。
   - 这能解决当前 1440 宽下海报区过挤的问题。

2. 视频 4 的涂抹效果很有记忆点。
   - 用户明确说“视频4的那个涂抹效果挺有意思”。
   - 建议用于海报 hover / active 时的项目说明揭示。
   - 不建议全站滥用，否则会花且影响鼠标响应。
   - 可做成墨水、海水、烧焦纸边、藏宝图擦除一类效果。

3. 视频 2 的船在海上漂适合做首屏氛围动效。
   - 用户提到“视频2那个船在海上漂的动画”。
   - 但当前背景图是一张烘焙好的长图，船和海没有分层。
   - 不建议直接移动整张背景图，会显得假。
   - 更稳的做法是轻量视差 / breathing，或者以后拆层后再做船、海浪、云、海鸥的分层动画。

4. 视频 1 可以作为次要参考。
   - 卡片空间感不错，但和当前 One Piece 悬赏令主题没有视频 3 / 4 贴。

## 下一步建议

优先实现这条路线：

1. 删除当前“5 张海报完全摊开”的布局。
2. 改成视频 3 风格的悬赏令轮播：
   - 中间主海报最大、最清晰。
   - 左右各露出 1-2 张候选海报。
   - 点击左右海报或箭头切换。
   - 支持键盘左右键。
   - 可选：鼠标滚轮在海报区内横向切换。
   - 移动端改成横向 swipe carousel，不要堆满屏。
3. 把视频 4 的涂抹揭示用于当前主海报的信息层：
   - hover / focus / tap 时揭示项目名、项目说明、按钮。
   - 不要用糊的黑色大蒙版。
   - 效果可以是 `clip-path` / CSS mask / radial gradient 跟随鼠标。
4. 首屏只做轻动效：
   - 背景图轻微 parallax。
   - 海鸥 / 云 / 海浪如果没有分层素材，暂时不要强行做大动画。

## 已验证

使用 `web-access` CDP Proxy 打开本地页面验证过：

- URL: `http://127.0.0.1:8097/`
- 页面 title: `Yang Labs | Be the first to build`
- 桌面导航 DOM: `["首页", "项目"]`
- CTA: `联系我`
- `.poster-hover-layer` 数量：5
- 旧正文残留检查：
  - `Wanted Bounties`: false
  - `Set Sail`: false
  - `Treasures`: false
  - `Crew`: false

截图临时路径：

- `/tmp/yanglabs-cdp-home.png`
- `/tmp/yanglabs-cdp-posters.png`

这些 `/tmp` 截图只是本轮验证证据，不保证长期存在。

## 重要注意

- 当前海报图片和 logo 仍然引用 Stitch 导出的远程 `lh3.googleusercontent.com/aida-public/...` 资源。后续部署前最好本地化。
- 当前页面右侧还有两个 Stitch / 辅助浮动圆形按钮残留，截图里能看到。下一步正式收口时建议删除，避免和小船鼠标、海报 hover 抢注意力。
- 当前 `docs/DESIGNS/` 在 worktree 状态里显示为未跟踪目录，里面有设计包、参考视频、截图等资源。不要随手删除。
- 用户希望先把设计/交互做准，再考虑部署合并。

## 推荐给下一位 Agent 的第一句话任务

继续在 worktree `/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/one-piece-voyage-portfolio` 里改 `/apps/portfolio/index.html`：把当前 5 张悬赏海报区改成参考视频 3 的物品轮播交互，并把参考视频 4 的涂抹揭示效果用于主海报 hover/active 信息层；保留当前 One Piece 长图背景、小船鼠标、中文导航和 5 个真实项目链接。完成后用 `web-access` CDP 打开 `http://127.0.0.1:8097/` 截图验证。
