---
title: 浏览器采集要控制标签数量并及时关闭
source: user-correction
occurrences: 1
status: active
created: 2026-06-09
updated: 2026-06-09
---

## Signal

用户指出：BOSS / Chrome 采集时不要一次性打开十几个标签，因为 Chrome 标签会占用大量内存；打开详情页采集完以后要及时关闭。

## Better Rule

做浏览器采集、岗位详情页读取、登录站点批量操作时，默认小批量打开页面。优先控制在 3-5 个详情页以内；每采完一批就写入本地结构化结果并关闭已完成标签，再继续下一批。不要为了并行而长期堆积大量 Chrome 标签。

## Where It May Graduate

AGENTS.md / job-search skill / web-access 操作模板。
