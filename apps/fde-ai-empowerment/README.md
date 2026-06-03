# toB 大模型转型范式集合

面向 toB 企业的大模型转型范式展示站：首页列出全部范式，每个范式对应一段 Agent 提示词与一个可体验的 Demo。

## 发布到 GitHub

本地已完成首次提交。在 GitHub 新建空仓库（不要勾选 README），仓库名建议 `tob-llm-paradigm-collection`，然后执行：

```bash
cd /Users/wayne/Documents/tob-llm-paradigm-collection

# 若尚未配置 Git 身份（仅需一次）
git config --global user.name "你的名字"
git config --global user.email "你的邮箱或 GitHub noreply 邮箱"

# 将 YOUR_USERNAME 换成你的 GitHub 用户名
git remote add origin https://github.com/YOUR_USERNAME/tob-llm-paradigm-collection.git
git push -u origin main
```

使用 SSH 时把 `origin` 地址改为 `git@github.com:YOUR_USERNAME/tob-llm-paradigm-collection.git`。

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

## 接入新范式（收到提示词后）

1. 编辑 `src/lib/paradigms/registry.ts`：更新对应条目的 `title`、`description`、`prompt`，并将 `status` 设为 `"live"`。
2. 在 `src/demos/` 下新建 Demo 组件（如 `paradigm-01.tsx`）。
3. 在 `src/demos/registry.tsx` 中注册：`demoComponents["paradigm-01"] = Paradigm01Demo`。

首页会自动显示「可体验」标记；详情页左侧为 Demo，右侧为可复制的提示词面板。

## 目录结构

```
src/
  app/                    # 首页 + /paradigms/[slug]
  components/             # 布局、首页卡片、范式详情壳
  demos/                  # 各范式交互 Demo
  lib/paradigms/          # 范式注册表与分类
```
