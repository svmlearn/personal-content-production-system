# 2026-06-04 智蛙面试报告排版微调记录

## 背景

用户在腾讯云部署后查看 `智蛙 AI 面试` 项目页，发现结构化面试手机报告里的字号层级不统一：

- 顶部总分卡内 `78`、`击败考生`、`作答用时` 等文字过大。
- `各题分数概览` 及每题题号 / 分数和下方报告区层级不一致。
- `能力表现分析` 雷达图左右两侧中文标签有裁切风险，尤其是 `综合能力` 的 `综` 和 `公职素养` 的 `养`。

目标不是重做页面，而是按用户指定口径统一现有手机报告字号。

## 改动文件

- `apps/portfolio/projects/zhiwa-ai-interview/styles.css`
- `apps/portfolio/projects/zhiwa-ai-interview/script.js`

## 最终排版口径

顶部总分卡：

- `78`：`17px`
- `表现良好`：`14px`
- `击败考生` / `作答用时`：`14px`
- `超过 68% 考生` / `16分32秒`：`14px`
- `时长适中` 胶囊：保持 `12px`

各题分数概览：

- `各题分数概览`：`14px`
- `第1题` / `第2题` 等题号：`12px`
- `72.5` / `88.2` 等每题分数：`12px`

能力表现分析：

- `能力表现分析`：跟通用报告卡标题一致，`14px`
- `五维单维度 20 分`：跟通用报告卡右侧小字一致，`10px`
- 雷达图维度名和分数：`13px`
- 雷达图 `labelRadius` 从 `90` 调整为 `80`，让左右文字完整落在 SVG viewBox 内，避免中文被裁切。

## 验证结果

本地使用静态服务和 headless Chrome 真实渲染验证，报告生成后读取计算样式：

- `score78`: `17px/15.3px`
- `overviewTitle`: `14px/normal`
- `rowLabel`: `12px/13.8px`
- `rowScore`: `12px/13.8px`
- `radarLabel`: `13px/normal`
- `radarScore`: `13px/normal`

SVG 文本边界验证：

- `语言表达 19分`、`公职素养 17分`、`政务思维 18分`、`应变控制 16分`、`综合能力 17分` 均在 `0..264` viewBox 范围内。
- `allLabelsInside: true`

## 提交与发布状态

相关代码提交：

- `8e85c62 fix: tune zhiwa interview score typography`
- `5b7e4c5 fix: align zhiwa report typography scale`
- `0d3964e fix: refine zhiwa report score layout`

`0d3964e` 已推送到 Gitee，并已同步到腾讯云服务器 `/opt/personal-website`。

本 progress 文档为后补记录；按用户要求，本次只提交并推送到 Gitee，不再额外拉取服务器。服务器可等下一次代码发布时一并同步该文档提交。
