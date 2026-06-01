# 智蛙申论批改体验台执行记录

日期：2026-06-01
分支：`work/zhiwa-ai-interview-project`
worktree：`/Users/wy/Desktop/个人IP/个人网站搭建-worktrees/zhiwa-ai-interview-project`
状态：实现完成，待用户视觉验收 / 待合并决策

## 1. 问题原貌

上一版智蛙项目页已经能从作品集进入独立项目空间，但“申论批改 Demo”仍是三类题型的静态说明。用户希望它更像一个可操作的体验台：

1. 读取最新 Dify YAML 的输入字段。
2. 题目直接展示给用户。
3. 用户答案可以一键填入演示答案。
4. 点击“运行批改”后，右侧显示 Dify 节点流转。
5. 最终生成结构化申论报告。
6. 报告参考已有 HTML 原型，并放在 iPhone 风格手机框内。

## 2. 来源核对

本轮读取并采用的 Dify YAML：

- `/Users/wy/Documents/工作经历归档/敏思跃动/智蛙面试/智蛙面试的app改版/V2.0 2026年1月/最终版使用/提出对策题-申论批改【V4】.yml`

该 YAML 的 start 输入字段：

- `information`：材料
- `question`：题目
- `answer`：考生答案
- `standardanswer`：参考答案
- `number_max`：最大字数
- `score`：题目总分
- `requirement`：题目要求
- `number_min`：最小字数

参考的申论报告 HTML 原型：

- `/Users/wy/Documents/工作经历归档/敏思跃动/智蛙面试/智蛙面试的app改版/V2.0 2026年1月/笔试（申论）/原型设计/当前版本/V4.0-笔试原型（2026-01-23最新）/申论报告内容-适用于归纳概括题.html`

原型中的报告模块包括：

1. 题目信息
2. 得分情况
3. 五维评价
4. 遗漏要点
5. 原文批改
6. 修改后答案
7. 解题思路
8. 参考答案

本轮没有直接复制原型 HTML，而是抽象其移动端报告结构和视觉语言，重做为当前作品集页面内的 iPhone 预览。

## 3. 实际改动

修改文件：

- `apps/portfolio/projects/zhiwa-ai-interview/index.html`
- `apps/portfolio/projects/zhiwa-ai-interview/styles.css`
- `apps/portfolio/projects/zhiwa-ai-interview/script.js`

主要变化：

1. 导航文案从“批改 Demo”改成“批改体验台”。
2. 将原来的三题型静态 Demo 改为“申论批改体验台”。
3. 左侧展示 Dify 输入字段映射：
   - `question` 对应题目展示
   - `answer` 对应用户作答
   - `standardanswer` 对应内置隐藏
   - `score / number` 对应评分约束
4. 左侧提供题目卡、答案输入框、“填入演示答案”和“运行批改”按钮。
5. `standardanswer`、`information`、`requirement`、`score`、`number_min`、`number_max` 在界面上不展示原始内容，仅作为真实接入时的后端输入口径和静态模拟数据。
6. 右侧新增 Dify 节点流转：
   - 字数检测
   - 要点拆分老师
   - 材料精读
   - 评分判断老师
   - 代码算分
   - 报告整合
7. 右侧新增 iPhone 风格报告预览：
   - 题目
   - 得分 `15/20`
   - 字数统计
   - 五维评价
   - 原文批改
   - 遗漏要点
   - 批改评语
   - 修改后答案

## 4. 重要边界

这仍然是静态演示，不是真实 Dify API 调用。

当前页面没有把 API key 或 URL 写进前端，也没有对外请求。`standardanswer` 被隐藏在 UI 中，但作为静态 demo 数据仍存在于前端 JS 里；如果下一步改成真实产品，应把参考答案、材料、评分规则和 Dify API key 全部放到后端代理，不应放在浏览器端。

## 5. 验证证据

语法检查：

```bash
node --check apps/portfolio/projects/zhiwa-ai-interview/script.js
```

结果：通过，无输出。

Diff 检查：

```bash
git diff --check
```

结果：通过，无输出。

浏览器验证使用 bundled Node + Playwright + 本机 Google Chrome：

- 页面：`apps/portfolio/projects/zhiwa-ai-interview/index.html#demo`
- 桌面视口：`1440x1100`
- 移动视口：`390x980`

桌面验证结果：

- console errors：0
- 点击“填入演示答案”后答案长度：265
- 点击“运行批改”后 6 个节点均进入 `完成`
- 手机报告包含 `15/20`
- 手机报告包含 `批改评语`
- 横向溢出：false

移动验证结果：

- console errors：0
- 点击“填入演示答案”和“运行批改”后报告生成成功
- 手机报告包含 `15/20`
- 手机报告包含 `批改评语`
- 横向溢出：false

截图留存：

- `/tmp/zhiwa-essay-review-console-desktop.png`
- `/tmp/zhiwa-essay-review-console-mobile.png`
- `/tmp/zhiwa-essay-review-console-mobile-final.png`

## 6. 半成功与中断点

1. 首次尝试用 Node REPL 直接导入 Playwright，失败原因是 Node REPL 环境没有 `playwright` 包。
2. 改用 bundled runtime 后，第一次 Playwright 启动失败，原因是 Playwright 自带 Chromium 未安装。
3. 最终使用本机 Google Chrome executablePath 完成验证。

这些只影响验证路径，不影响页面实现。

## 7. 未覆盖范围与风险

未做：

1. 未接真实 Dify `/workflows/run` API。
2. 未做流式输出。
3. 未把 YAML 自动解析成页面配置。
4. 未把已有 HTML 原型完整嵌入 iframe。
5. 未做线上部署验证。

剩余风险：

1. 静态 demo 只能表达交互和产品形态，不能证明真实工作流在线可用。
2. 手机报告是根据原型结构重做的轻量版本，不是完整智蛙 App 报告。
3. 若后续要作为真实演示，需要新增后端代理，避免 `standardanswer`、评分规则和 Dify key 暴露。

## 8. 恢复路径

如需回退本轮改动：

1. 将 `apps/portfolio/projects/zhiwa-ai-interview/index.html` 的 demo section 恢复为上一版三题型 Demo。
2. 恢复 `apps/portfolio/projects/zhiwa-ai-interview/script.js` 中的 `demoCases` 和 `renderDemo`。
3. 删除本轮新增的体验台 CSS。
4. 删除本 progress 和对应 handoff。

如需继续增强：

1. 优先把后端代理接口设计出来：前端表单 -> backend proxy -> Dify workflow -> streaming result。
2. 再把 `提出对策题`、`归纳概括题`、`综合分析题` 的 YAML 输入字段统一成前端 schema。
3. 最后把报告组件拆成可复用的移动端报告模板。

## 9. Review 修复

只读 `code-reviewer` 审查结论：无阻塞问题，可作为待验收分支。

已按非阻塞建议处理：

1. 将页面文案从“参与批改”口径收紧为“隐藏演示数据 / 静态模拟”，避免误读为真实 Dify API 已接入。
2. 给 Dify 字段映射和 iPhone 报告预览补充 `role`，让 `aria-label` 有明确语义承载。
