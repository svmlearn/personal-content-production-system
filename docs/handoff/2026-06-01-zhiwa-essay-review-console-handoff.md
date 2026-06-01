# 智蛙申论批改体验台 Handoff

日期：2026-06-01
状态：实现完成，待用户验收 / 待合并决策

## 1. 当前目标

把智蛙项目页里的“申论批改 Demo”升级成一个可点击体验台：用户看到题目，能一键填入演示答案，点击运行后在 iPhone 风格手机框内生成结构化申论批改报告。

## 2. Worktree / Branch

- worktree：`/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/zhiwa-ai-interview-project`
- branch：`work/zhiwa-ai-interview-project`
- base：`main`
- long-task-gate：disabled
- push：未 push
- merge：未 merge

## 3. 已完成内容

1. 读取最新可用的正式版提出对策题 Dify YAML：
   - `提出对策题-申论批改【V4】.yml`
   - start 输入字段确认为 `information`、`question`、`answer`、`standardanswer`、`number_max`、`score`、`requirement`、`number_min`。

2. 参考 V4.0 申论报告 HTML 原型：
   - `申论报告内容-适用于归纳概括题.html`
   - 抽象了题目、得分、五维评价、遗漏要点、原文批改、批改评语、修改后答案等报告模块。

3. 改造智蛙项目页：
   - `apps/portfolio/projects/zhiwa-ai-interview/index.html`
   - `apps/portfolio/projects/zhiwa-ai-interview/styles.css`
   - `apps/portfolio/projects/zhiwa-ai-interview/script.js`

4. 新体验台包含：
   - 题目展示
   - 用户答案 textarea
   - “填入演示答案”
   - “运行批改”
   - iPhone 风格结构化报告预览
   - 参考原型的原文批改样式：绿色命中高亮、得分章、红色波浪线、旁批、老师评语、修改后答案
   - 静态模拟边界说明，避免误读为真实 Dify API 已接入
   - 移动端报告生成前的轻量加载状态

5. 写入执行记录：
   - `docs/progress/2026-06-01-zhiwa-essay-review-console.md`

## 4. 验证结果

命令验证：

- `git diff --check`：通过，无输出。
- `node --check apps/portfolio/projects/zhiwa-ai-interview/script.js`：通过，无输出。

浏览器验证：

- 桌面 `1440x1100`：
  - console errors：0
  - 预填答案成功
  - 运行批改后报告生成成功
  - 报告包含 `原文批改`、`批改评语`、`修改后答案`
  - 横向溢出：false

- 移动 `390x980`：
  - console errors：0
  - 预填答案成功
  - 运行批改后报告生成成功
  - 报告包含 `原文批改`、`批改评语`、`修改后答案`
  - 横向溢出：false

截图：

- `/tmp/zhiwa-essay-review-console-desktop.png`
- `/tmp/zhiwa-essay-review-console-mobile-final.png`
- `/tmp/zhiwa-essay-review-polished-desktop.png`
- `/tmp/zhiwa-essay-review-polished-mobile.png`

## 5. 重要边界

当前不是实时 Dify 调用，而是静态体验模拟。

当前前端只保留演示题目、演示答案和报告展示文案。若后续接真实 Dify，必须把参考答案、材料、评分规则、API key 和 Dify URL 放到后端代理，不要放到浏览器端。

只读 `code-reviewer` 已复核：无阻塞问题，可作为待验收分支。已按建议收紧文案边界。

后续用户浏览器批注要求移除偏解释型模块，已进一步收窄页面：

- 删除 `Product Ownership / 这段项目展示的能力`。
- 删除 `Growth Conversion / 增长转化`。
- 删除 `Dify Workflow / Dify 工作流`。
- 删除体验台里的 Dify 输入字段映射、隐藏输入说明和节点流转列表。
- 顶部导航只保留 `产品全景`、`批改体验台`。

## 6. 改动文件

- `apps/portfolio/projects/zhiwa-ai-interview/index.html`
- `apps/portfolio/projects/zhiwa-ai-interview/styles.css`
- `apps/portfolio/projects/zhiwa-ai-interview/script.js`
- `docs/progress/2026-06-01-zhiwa-essay-review-console.md`
- `docs/handoff/2026-06-01-zhiwa-essay-review-console-handoff.md`

## 7. 未做事项

1. 未接真实 Dify `/workflows/run` API。
2. 未做 stream 模拟或真实流式输出。
3. 未把 YAML 自动解析为前端表单 schema。
4. 未完整复刻 App 里的全部报告模块。
5. 未 push，未 merge。

## 8. 下一步建议

1. 用户先看视觉和体验是否符合“智蛙项目展示”的预期。
2. 如果认可，可以把本分支作为待合并交付。
3. 如果要继续增强，下一轮先设计后端代理和 Dify workflow 调用契约，再接真实 API。
