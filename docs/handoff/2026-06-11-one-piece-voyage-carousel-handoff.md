# One Piece Voyage Portfolio - Carousel Interaction Handoff

日期：2026-06-11

## 当前目标

继续改造 `/apps/portfolio/` 首页，把悬赏海报区从 5 张摊开布局改成更接近参考交互视频的作品项目入口。

本轮用户明确要求：先提交上一阶段基线 commit，再重新查看 `docs/DESIGNS/参考交互视频1.mp4` 到 `参考交互视频4.mp4`，想清楚后再继续实现。

## Worktree / Branch

- Worktree: `/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/one-piece-voyage-portfolio`
- Branch: `codex/one-piece-voyage-portfolio`
- Baseline commit: `9877ae3 Freeze one piece voyage portfolio baseline`
- Implementation commit: `d6cf485 Add bounty poster carousel interactions`
- 当前未 merge 到 `main`
- 当前未 push

## 视频复看后的判断

参考视频位置在主工作区：

- `/Users/wy/Desktop/个人IP/个人网站搭建/docs/DESIGNS/参考交互视频1.mp4`
- `/Users/wy/Desktop/个人IP/个人网站搭建/docs/DESIGNS/参考交互视频2.mp4`
- `/Users/wy/Desktop/个人IP/个人网站搭建/docs/DESIGNS/参考交互视频3.mp4`
- `/Users/wy/Desktop/个人IP/个人网站搭建/docs/DESIGNS/参考交互视频4.mp4`

抽帧临时文件：

- `/tmp/one-piece-voyage-video-frames/video1-sheet.jpg`
- `/tmp/one-piece-voyage-video-frames/video2-sheet.jpg`
- `/tmp/one-piece-voyage-video-frames/video3-sheet.jpg`
- `/tmp/one-piece-voyage-video-frames/video4-sheet.jpg`
- `/tmp/one-piece-voyage-video-frames/video3-detail.jpg`
- `/tmp/one-piece-voyage-video-frames/video4-detail.jpg`

判断：

1. 视频 3 适合悬赏海报区，重点不是普通横滑列表，而是“中心主物件稳定 + 侧向物件飞入/飞出 + 项目状态切换”。
2. 视频 4 适合信息揭示，重点是黑色流体 / 墨迹状擦入，不是规则圆形蒙版。
3. 视频 2 适合首屏氛围，但当前背景是烘焙长图，没有船、海浪、云的分层素材，所以只做轻微 breathing，不做大幅漂移动画。
4. 视频 1 的空间透视可参考，但人物/道路叙事不适合直接搬到当前 One Piece 悬赏令主题。

## 已完成内容

改动文件：

- `/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/one-piece-voyage-portfolio/apps/portfolio/index.html`

具体实现：

1. 保留 One Piece 长图背景、小船鼠标指针、中文导航和 5 个真实项目链接。
2. 把原 5 张海报 flex 摊开布局改成悬赏令 carousel：
   - 中间主海报最大、最清晰。
   - 左右各露出候选海报。
   - 更远侧海报半透明、上下错位，模拟视频 3 的物件入场感。
3. 支持交互：
   - 左右箭头切换。
   - 圆点切换。
   - 点击侧边海报切换。
   - 键盘左右键切换。
   - 在 carousel 区域滚轮切换。
   - 移动端 pointer swipe 切换。
4. 主海报 hover / focus / tap 信息揭示：
   - 信息层使用不规则 `clip-path polygon` 墨迹边界。
   - 叠加暗海水 / 墨迹感渐变和 blob 边缘，避免普通黑色矩形蒙版。
5. 给页面加了内联 SVG favicon，避免浏览器自动请求 `/favicon.ico` 产生 404。

## 验证结果

本地服务：

```bash
python3 -m http.server 8097 -d apps/portfolio
```

验证 URL：

- `http://127.0.0.1:8097/`

静态检查：

```bash
node -e "const fs=require('fs'); const html=fs.readFileSync('apps/portfolio/index.html','utf8'); const scripts=[...html.matchAll(/<script(?:[^>]*)>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(s=>!s.includes('tailwind.config')); for (const s of scripts) new Function(s); console.log('scripts parse ok:', scripts.length);"
```

结果：

- `scripts parse ok: 2`

Chrome / Playwright 实测结论：

- 页面 title: `Yang Labs | Be the first to build`
- 桌面 carousel 卡片数：5
- 初始 active 项目：`智蛙 AI 面试`
- 点击下一张后 active 项目：`AI 学习伴侣`
- active dot index：1
- hover 信息层 opacity：1
- hover 信息层 clip-path 为不规则 polygon
- 桌面 body width / viewport width：`1440 / 1440`，无横向溢出
- 移动端 body width / viewport width：`390 / 390`，无横向溢出
- 旧文案残留：
  - `Wanted Bounties`: false
  - `Set Sail`: false
  - `Treasures`: false
  - `Crew`: false
- page errors：无
- console 仅剩 Tailwind CDN 原有生产环境 warning，不是本轮改动引入的错误。

验证截图临时路径：

- `/tmp/one-piece-voyage-verify-desktop.png`
- `/tmp/one-piece-voyage-verify-hover.png`
- `/tmp/one-piece-voyage-verify-mobile.png`

这些 `/tmp` 文件只是本轮验证证据，不保证长期存在。

## 当前未完成 / 风险

1. 海报图片和 logo 仍引用远程 `lh3.googleusercontent.com/aida-public/...`，后续部署前建议本地化。
2. Tailwind 仍通过 CDN 加载，会有生产环境 warning；如果要正式部署，建议后续再改成本地构建或纯 CSS 收口。
3. 当前背景图是烘焙长图，只做轻微 breathing；如果想复刻视频 2 的船和海浪动画，需要重新拆层或生成分层素材。
4. `docs/DESIGNS/` 仍有未跟踪参考资料，未纳入本轮实现 commit，不要误删。

## 下一步建议

1. 用户先在 `http://127.0.0.1:8097/` 验收 carousel 手感和墨迹揭示。
2. 如果方向认可，再做部署前收口：
   - 本地化远程海报和 logo。
   - 处理 Tailwind CDN。
   - 视情况微调移动端主海报尺寸和按钮位置。
3. 暂不合并到 `main`，等待用户验收。
