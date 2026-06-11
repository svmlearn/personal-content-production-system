---
title: 岗位池用户反馈列只归用户填写
source: user-correction
occurrences: 1
status: active
created: 2026-06-10
updated: 2026-06-10
---

## Signal

用户指出岗位池中 `用户反馈` 是用户本人写判断和修正的列，不应由 AI 写入筛选理由。AI 自己根据 job-search skill 做出的判断应写在 `初判状态`，`投递意愿` 只放 `无 / 低 / 中 / 高` 等级。

## Better Rule

维护飞书岗位池时，AI 只写：

- `初判状态`：AI 的筛选理由、风险判断、降权原因、不确定性。
- `投递意愿`：AI 给出的结构化等级。

AI 不写 `用户反馈`，除非用户明确给出要写入的反馈文本。已有 `用户反馈` 必须原样保留，并作为后续判断的最高优先级偏好信号。

## Where It May Graduate

`.codex/skills/job-search/SKILL.md`、岗位池写入模板、后续批量导入脚本。
