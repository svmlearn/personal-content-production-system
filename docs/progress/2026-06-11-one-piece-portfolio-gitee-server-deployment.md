# 2026-06-11 One Piece 作品集与求职资料部署记录

## 范围

本轮将 One Piece 航海主题作品集改版、项目详情层、求职 / 简历资料归档提交到 `main`，推送到 Gitee，并同步到腾讯云服务器。

## 本地提交

- `110a501 Add One Piece project detail overlay`
  - 新增作品集项目详情层。
  - 调整海报 hover 浮层、CTA 分类、项目文案和 One Piece 视觉。
- `a971871 Archive job search and resume work`
  - 归档 job-search skill、求职进度记录、求职数据产物、feedback 和简历 HTML/PDF。

未提交内容：

- `docs/DESIGNS/`：本地参考素材目录。
- `docs/progress/artifacts/job-search/xlsx-build/node_modules`：指向 Codex runtime 的本地符号链接。

## Gitee 推送

- Remote：`git@gitee.com:mr_wang112/personal-website.git`
- Branch：`main`
- 推送结果：`e1eb5ec..a971871  main -> main`

## 服务器部署

服务器：

- 腾讯云轻量：`43.129.207.237`
- SSH user：`ubuntu`
- SSH key：`/Users/wy/.ssh/tencent_lighthouse_personal_website`
- 仓库目录：`/opt/personal-website`

部署命令：

```bash
cd /opt/personal-website
git fetch origin main
git merge --ff-only origin/main
```

部署结果：

- 服务器从 `58b4422` fast-forward 到 `a971871`。
- 服务器状态：`## main...origin/main`
- 服务器当前提交：`a971871 Archive job search and resume work`

本轮没有执行 `pnpm install --frozen-lockfile`，因为没有修改 package / lockfile。

本轮没有重启 PM2 服务，因为 `2young.xin` 作品集由 Nginx 直接静态服务 `/opt/personal-website/apps/portfolio`，拉取文件后立即生效。

PM2 状态检查：

- `ai-learning-companion`：online
- `content-generation-worker`：online
- `content-growth-platform`：online
- `fde-ai-empowerment`：online

## 线上验证

主站：

- `GET https://2young.xin/` 返回新页面 DOM。
- 页面中匹配：
  - `voyage-long-background-posters-gull.png`
  - `Grand Line Dossier`
  - `查看项目原型 / PROTOTYPE`
  - `进入线上系统 / LIVE APP`
  - `查看开源项目 / GITHUB`

静态资源：

- `GET https://2young.xin/assets/images/voyage-long-background-posters-gull.png`
- 返回：`200 OK`
- `Content-Type: image/png`
- `Content-Length: 2876324`

## 当前状态

- Gitee `origin/main` 已到 `a971871`。
- 服务器 `/opt/personal-website` 已到 `a971871`。
- 主站 `https://2young.xin/` 已显示 One Piece 航海主题作品集新版。

## 遗留事项

1. `docs/DESIGNS/` 仍是未跟踪的本地参考素材目录，未提交。
2. `docs/progress/artifacts/job-search/xlsx-build/node_modules` 是本地符号链接，未提交。
3. 本次没有做移动端人工验收；只验证了线上 DOM 和关键静态资源。
