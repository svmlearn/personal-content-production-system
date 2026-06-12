# 2026-06-11 Portfolio Project Cards Handoff

## 当前目标

将个人网站首页从海盗悬赏海报项目区调整回上一版成熟作品集卡片样式，同时保留本轮新增的首屏个人介绍和当前项目详情弹窗。

## 已完成内容

- `apps/portfolio/index.html`
  - 保留首屏个人介绍：头像、姓名、AI 产品经理 / AI 产品架构、Profile、Agent 工作系统。
  - 将主背景从动漫航海图改为中性作品集玻璃背景。
  - 顶部导航从整条浅色块改为浮动透明玻璃胶囊，减少与页面主体的割裂感。
  - 在个人介绍前新增“AI 做有趣的事儿”态度开场页，用大字标题、滚动能力标签和 5 段职业主线表达个人 AI 产品观点。
  - 态度页说明文案改为从软件世界进入物理世界，以及从 `Prompt Engineering` 到 `Harness Engineering` 再到 `Loop Engineering`。
  - 2026-06-12 后续调整：态度页底部从 5 张有框经历卡片改为 4 段无框文字路径，围绕 `KeploreAI / 智蛙面试 / 学习伴侣 & 内容系统 / FDE & AI Coding` 表达“AI 如何参与真实工作，以及 FDE 从 PRD 到真实运行应用”的主线。
  - 将项目区从 5 张悬赏海报替换为 5 张上一版风格的项目卡片：
    - 智蛙 AI 面试
    - AI 学习伴侣
    - 内容获客平台
    - FDE 企业 AI
    - Agent Harness
  - 项目区标题已调整为“工作经历”，并删除原项目区说明段落。
  - 项目卡片 carousel 去掉 `perspective / translate3d / scale / backdrop-filter` 造成的文字发虚问题，保留轻微 `rotate`，让卡片有层次但不再明显发糊。
  - 点击当前项目卡片打开现有项目详情弹窗。
  - 详情弹窗按钮保留“进入 / 查看项目”链路，去掉 `BOUNTY / Grand Line / Wanted Poster / sailing` 等海盗主题残留。
  - 详情左侧项目预览已从生成 SVG 占位图替换为 5 张真实项目截图，并调整为产品截图窗口比例，避免横图压住右侧项目标题。
  - 已移除旧自定义鼠标逻辑，恢复系统默认鼠标。
  - 移动底部导航增加图标容器约束，避免 Material Symbols 字体加载失败时用图标名撑破布局。
  - 2026-06-12 本地后续调整：将 Google Fonts 改为 `fonts.loli.net / gstatic.loli.net` 国内镜像；移除 Material Symbols 外链，并把站内 10 个图标替换为内联 SVG sprite。
- `apps/portfolio/assets/images/yang-ai-pm-avatar.png`
  - 从简历头像复制并压缩到约 255KB，供首屏使用。
- `apps/portfolio/assets/images/project-screenshots/`
  - 新增 5 张项目详情截图资源：
    - `zhiwa-ai-interview.png`
    - `ai-learning-companion.png`
    - `content-growth-platform.png`
    - `fde-enterprise-ai.png`
    - `agent-harness.png`

## 验证结果

- 本地静态服务：`python3 -m http.server 4177 --bind 127.0.0.1`
- 桌面浏览器验证：
  - 首页加载正常。
  - 顶部导航为透明浮动胶囊，不再是整条浅黄底色。
  - 首屏为“AI 做有趣的事儿”态度页，原个人介绍位于下一屏。
  - 5 张项目卡片渲染正常。
  - 项目区标题显示“工作经历”，原说明文案已删除。
  - 项目卡片渲染检查通过：卡片 transform 仅保留 2D 位移 + 轻微旋转，无 scale / 3D，`backdrop-filter` 为 `none`，页面无横向溢出。
  - 原航海背景图不再出现。
  - 点击当前卡片可打开项目详情弹窗。
  - 详情弹窗显示 `PROJECT-01`、真实项目截图、详情内容和项目按钮。
  - 页面无横向溢出。
  - 5 个项目详情弹窗均加载真实截图，主图与标题区域无重叠，缩略图数量为 5。
  - 自定义鼠标残留检查通过：无 `.voyage-cursor` 元素、无 `voyage-cursor-ready` class，`body` cursor 为 `auto`。
  - 字体 / 图标本地检查通过：页面无 `fonts.googleapis.com`、`fonts.gstatic.com`、`material-symbols` 残留；浏览器请求中 Google 字体请求为 0，SVG 图标数为 10，详情弹窗和项目导航图标尺寸正常。
  - 态度页 4 段文字路径验证通过：桌面与移动端均为 4 段内容，无彩色节点、无卡片外框、无横向溢出；截图记录为 `/tmp/portfolio-attitude-four-desktop.png`、`/tmp/portfolio-attitude-four-mobile.png`。
- 移动视口 `390x844` 验证：
  - 项目区 5 张卡片存在，当前卡片完整展示。
  - 页面无横向溢出。
  - 底部导航图标容器宽度受控，不再被 `workspace_premium` 文本撑破。

## 当前状态

- 未 commit。
- 未 push。
- 未 merge。
- 本地预览服务当前运行中：`http://127.0.0.1:4177/`。

## 注意事项

- `apps/portfolio/index.html` 中仍有未使用的旧 `bounty-*` CSS 残留；当前 DOM 和 JS 已切换为 `project-*` 触发器，可见页面不再使用悬赏海报。后续如要清理文件体积，可以单独做一次 CSS 死代码清理。
- `docs/DESIGNS/` 是本地参考素材目录，未纳入本次提交。
- `docs/progress/artifacts/job-search/xlsx-build/node_modules` 是本地依赖目录 / 链接，受 `.gitignore` 约束，未纳入本次提交。
