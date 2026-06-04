# 2026-06-04 FDE 企业 AI 赋能接入 Handoff

## 当前目标

在作品集主页新增 `FDE 企业 AI 赋能` 项目入口，并把 `gaoweiblue-source/tob-llm-paradigm-collection` 仓库作为正式项目内容纳入当前工作区。

## 已完成

- 已从 GitHub 克隆来源仓库到本地来源副本：`refrences/tob-llm-paradigm-collection/`。
- 已将仓库内容完整同步到正式应用目录：`apps/fde-ai-empowerment/`，排除了来源仓库自身的 `.git`。
- 已在作品集首页数据里新增 `FDE 企业 AI 赋能` 项目卡片与详情。
- 已给 FDE 详情页增加独立主题色。
- `进入该项目` 按钮指向本地服务：`http://localhost:3004/`。

## 验证结果

- `node --check apps/portfolio/script.js` 通过。
- `npm run build` 在 `apps/fde-ai-empowerment/` 通过。
- FDE 开发服务已启动在 `http://localhost:3004/`。
- 作品集首页 `FDE 企业 AI 赋能` 详情验证通过，入口 href 为 `http://localhost:3004/`。

## 注意事项

- `apps/fde-ai-empowerment/` 保留原项目依赖版本。安装时 npm 提示 `next@15.2.4` 有安全版本提示，本轮按“原封不动迁入”原则未升级。
- `npm install` 生成的 `node_modules/`、`.next/`、`next-env.d.ts` 被应用内 `.gitignore` 忽略，不应提交。
- 当前分支：`codex/fde-ai-empowerment`。
- 当前状态：待用户验收后决定是否合并到 `main`。
