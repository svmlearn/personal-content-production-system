# 2026-06-16 咨询右侧策略资产工具参数改造

## 问题原貌

在小红书内容平台的咨询 Agent 中，用户要求更新右侧策略资产时，模型调用 `update_strategy_snapshot` 并传入 `positioning`、`coreSellingPoints` 等字段，但运行时返回：

> 工具调用未通过运行时校验，当前环境不允许通过 update_strategy_snapshot 传入 positioning、coreSellingPoints 等参数。

这会导致右侧策略资产未更新，而模型只能建议改用 `update_content_calendar` 生成内容日历。

## 根因

`update_strategy_snapshot` 原先被实现为“空对象触发器”：外层工具只允许 `{}`，真正的字段改写由内部 `update_strategy_asset_editor` 根据上下文再生成完整策略资产。

该设计保留了内部 Editor 和 guardrail，但外层工具协议和内容日历不一致：

- `update_content_calendar`：Agent 传结构化参数，runtime 校验后写入。
- `update_strategy_snapshot`：Agent 只能传 `{}`，传业务字段会被 zod strict schema 拒绝。

因此，当主 Agent 已经知道要改哪些资产字段时，结构化输出会被第一层校验挡住，内部 Editor 没机会启动。

## 实际改动

改造 `update_strategy_snapshot` 外层工具协议：

- 支持 `changedFields + patch` 结构化参数。
- 支持兼容顶层字段：`positioning`、`coreSellingPoints`、`targetAudiences`、`keyScenes`、`strategyTags`、`strategyMarkdown`。
- 保留空 `{}` 兜底：没有传任何资产字段时，仍走内部 Editor 根据上下文推断修改。
- 传入 patch 时只处理实际提供的字段，未传字段保持当前策略资产不变。
- direct patch 仍进入 `guardStrategyAssetEditorPatch`，来源标记为 `direct_tool_patch`，不绕过低置信意图、脏内容和有效变更校验。
- 未知字段如 `currentSuggestion` 仍会被 strict schema 拒绝，并返回明确校验错误。

## 改动文件

- `apps/content-growth-platform/src/server/api/consultation-runtime/tools.ts`
- `apps/content-growth-platform/src/server/api/consultation-runtime/guards.ts`
- `apps/content-growth-platform/src/server/api/consultation-service.ts`
- `apps/content-growth-platform/src/server/api/consultation-service.test.ts`

## 验证证据

在 worktree `/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/strategy-snapshot-patch-tool` 执行：

```bash
pnpm --dir apps/content-growth-platform typecheck
node --test apps/content-growth-platform/src/server/api/consultation-service.test.ts
git diff --check
pnpm --dir apps/content-growth-platform build
```

结果：

- `typecheck` 通过。
- `consultation-service.test.ts` 通过，62/62。
- `git diff --check` 通过。
- `next build` 通过。

## 注意事项

第一次 build 曾因临时把 worktree `node_modules` symlink 到主工作区而被 Turbopack 拒绝，错误为 symlink 指向项目 root 外。随后已删除 symlink，并用 `pnpm install --frozen-lockfile --offline` 在 worktree 内生成真实依赖目录后重新验证，build 通过。

worktree 内的 `node_modules`、`.next`、`tsconfig.tsbuildinfo` 均为 ignored 验证产物，不应提交。

## 当前状态

代码已在分支 `codex/strategy-snapshot-patch-tool` 中完成，待提交/合并。
