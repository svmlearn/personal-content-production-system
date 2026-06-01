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
4. 点击“运行批改”后，右侧手机框生成报告。
5. 最终生成结构化申论报告。
6. 报告参考已有 HTML 原型，并放在 iPhone 风格手机框内。

后续用户在浏览器批注中进一步要求移除工作流、增长转化、节点流转、字段映射和隐藏输入说明等解释型模块，因此当前页面已收窄为面向访客的批改体验。

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

1. 顶部导航收窄为 `产品全景`、`批改体验台`。
2. 将原来的三题型静态 Demo 改为“申论批改体验台”。
3. 删除独立 Dify Workflow、Growth Conversion、Product Ownership 模块。
4. 删除体验台里的 Dify 输入字段映射、隐藏输入说明和节点流转列表。
5. 左侧保留题目卡、答案输入框、“填入演示答案”和“运行批改”按钮。
6. 右侧保留 iPhone 风格报告预览：
   - 题目
   - 得分 `15/20`
   - 字数统计
   - 五维评价雷达图
   - 原文批改白卡片，使用绿色命中高亮、加分标记和红色扣分提示
   - 击败考生、作答用时和扣分提示
   - 批改评语
   - 修改后答案
7. 结合本地 V4.0 原型、Dify YAML 中 `批改富文本渲染` 节点，以及后续补充的 App Store 官方截图，重做右侧手机报告视觉：
   - 顶部 `申论报告` 导航样式
   - `分数说明` 入口
   - 得分圆环
   - 事实指标区：击败考生、作答用时
   - 浅红扣分提示条
   - 五维评价雷达图
   - 原文批改双标签卡片
   - 绿色修改后答案卡

## 4. 重要边界

这仍然是静态演示，不是真实 Dify API 调用。

当前页面没有把 API key 或 URL 写进前端，也没有对外请求。当前前端只保留演示题目、演示答案和报告展示文案；如果下一步改成真实产品，应把参考答案、材料、评分规则和 Dify API key 全部放到后端代理，不应放在浏览器端。

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
- 点击“运行批改”后手机报告生成成功
- 手机报告包含 `原文批改`、`批改评语`、`修改后答案`
- 横向溢出：false

移动验证结果：

- console errors：0
- 点击“填入演示答案”和“运行批改”后报告生成成功
- 手机报告包含 `原文批改`、`批改评语`、`修改后答案`
- 横向溢出：false

截图留存：

- `/tmp/zhiwa-essay-review-console-desktop.png`
- `/tmp/zhiwa-essay-review-console-mobile.png`
- `/tmp/zhiwa-essay-review-console-mobile-final.png`
- `/tmp/zhiwa-essay-review-polished-desktop.png`
- `/tmp/zhiwa-essay-review-polished-mobile.png`

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
2. 给 iPhone 报告预览补充语义化标注；后续浏览器批注要求删除字段映射，因此该字段映射最终已移除。

## 10. 浏览器批注收窄

用户在浏览器批注中明确要求移除偏解释和偏展示能力的模块。本轮已处理：

1. 删除 `Product Ownership / 这段项目展示的能力` 整块。
2. 删除 `Growth Conversion / 增长转化` 整块。
3. 删除 `Dify Workflow / Dify 工作流` 整块。
4. 删除体验台里的 Dify 输入字段映射。
5. 删除体验台里的隐藏输入说明。
6. 删除体验台右侧的 Dify 节点流转列表。
7. 顶部导航同步收窄为 `产品全景`、`批改体验台`。
8. 页面可见文案从“工作流 / 增长 / 付费路径”进一步收窄为“申论批改体验”。

处理后的页面保留：

1. 首屏项目定位。
2. 产品全景。
3. 申论批改体验台：题目、答案输入、填入演示答案、运行批改、iPhone 报告预览。

## 11. 用户反馈记录

用户明确纠正：这是作品展示，不需要大量“我做了什么”的描述，重点应放在可直接看的展示结果上。

已按 `feedback-writer` 记录到项目反馈：

- `.codex/feedback/portfolio-showcase-less-explanation.md`

## 12. 绿色主题对齐

用户进一步指出独立项目页视觉应与上一层作品集详情保持一致，智蛙项目主视觉应为绿色系。

已处理：

1. 将独立项目页根色板对齐上一层 `project-detail[data-theme="zhiwa"]`：
   - 背景：`#edfff7`
   - 主绿：`#0eb698`
   - 辅助薄荷绿：`#8fe6c0`
2. 将页面背景、顶部导航、卡片边框、卡片阴影、主按钮、iPhone 外框阴影、手机报告底色和评分条从蓝色倾向调整为绿色倾向。
3. 清理项目页 CSS 中旧蓝色变量和蓝色渐变残留。
4. 再次验证真实页面里不存在用户浏览器批注中提到的旧模块文本：
   - `DIFY 节点流转`
   - `Dify 工作流：`
   - `增长转化`

补充浏览器验证：

- 桌面视口：`1440x1100`
- 移动视口：`390x1200`
- console errors：0
- 横向溢出：false
- 主题变量检测：`--page: #edfff7`、`--green: #0eb698`、`--mint: #8fe6c0`
- 点击“填入演示答案”和“运行批改”后报告仍正常生成
- 报告仍包含 `原文批改`、`批改评语`、`修改后答案`
- 旧解释型模块文本检测：false

补充截图：

- `/tmp/zhiwa-green-desktop.png`
- `/tmp/zhiwa-green-mobile.png`

## 13. 公开报告样式参考与二次改版

用户指出当前手机报告还不是更接近原版的样式，并要求去小红书等公开渠道找智蛙申论报告参考。

本轮补充调研：

1. 小红书搜索 `智蛙面试 申论报告`：
   - 搜索页出现相关搜索：`智蛙申论报告模板下载`、`智蛙申论报告怎么用`。
   - 直接结果中未找到清晰可确认的“申论报告原版完整截图”。
   - 找到一张智蛙面试反馈截图，样式特征是绿色渐变顶部、白色圆角卡片、总分大号展示和四项能力条，可作为同品牌报告语言参考。
   - 搜索截图留存：`/tmp/xhs-zhiwa-search.png`
   - 疑似反馈截图留存：`/tmp/zhiwa-xhs-images/xhs1-first-green.webp`
2. App Store 官方页面 `智蛙公考`：
   - 公开官方截图中出现 `AI申论智能批改`。
   - 该截图比小红书结果更接近当前要复刻的申论报告 UI。
   - 关键样式：顶部 `申论报告`、右侧 `分数说明`、圆环得分、击败考生、作答用时、浅红扣分提示、多维雷达图、原文批改卡、提升建议。
   - 参考截图留存：
     - `/tmp/zhiwa-appstore/appstore-02.jpg`
     - `/tmp/zhiwa-appstore/appstore-07.jpg`

已据此调整：

1. `apps/portfolio/projects/zhiwa-ai-interview/script.js`
   - 手机报告顶部使用 `申论报告`。
   - 增加 `分数说明`、击败考生、作答用时、扣分提示条。
   - 五维评价从横向进度条改为雷达图。
   - 原文批改改为官方截图更接近的白卡片、双标签、绿色高亮、加分标记结构。
   - 保留 `批改评语` 和 `修改后答案`，保证作品展示里仍能看到结构化报告闭环。
2. `apps/portfolio/projects/zhiwa-ai-interview/styles.css`
   - 新增官方报告式白卡、雷达图、扣分条、双标签和原文批改样式。
   - 删除不再使用的旧版富文本批改样式、统计块和对应脚本 helper。

补充验证：

- `node --check apps/portfolio/projects/zhiwa-ai-interview/script.js`：通过。
- 桌面视口 `1440x1200`：console errors 0，横向溢出 false。
- 移动视口 `390x1300`：console errors 0，横向溢出 false。
- 报告文本包含：`申论报告`、`分数说明`、`击败考生`、`五维评价`、`原文批改`、`修改后答案`。
- 旧解释型模块文本检测：false。
- 旧版报告文案检测：false。

补充截图：

- `/tmp/zhiwa-official-report-desktop.png`
- `/tmp/zhiwa-official-report-mobile.png`
- `/tmp/zhiwa-official-report-phone-detail.png`
- `/tmp/zhiwa-official-report-phone-bottom.png`
