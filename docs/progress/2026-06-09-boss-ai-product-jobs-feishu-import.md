# 2026-06-09 BOSS AI 产品岗位采集与飞书导入记录

## 目标

根据 BOSS 直聘深圳 AI 产品相关岗位，先采集一批薪资大致在 18-30K 附近、可供用户后续判断是否匹配的岗位，并整理到飞书多维表格。

用户要求字段包括：岗位、公司、薪资、公司人数、公司业务、JD、注册资本、福利待遇、职位链接，并预留用户反馈。

## 采集结果

- 采集日期：2026-06-09
- 来源：BOSS 直聘岗位列表和逐个详情页
- 岗位数：15
- 本地 CSV：`docs/progress/artifacts/job-search/boss-ai-product-jobs-20260609.csv`
- 本地 XLSX：`docs/progress/artifacts/job-search/boss-ai-product-jobs-20260609.xlsx`
- 原始 JSON：`docs/progress/artifacts/job-search/boss-ai-product-jobs-raw.json`

注意：第 9 条为 BOSS 匿名猎头岗位“某大型互联网公司”，平台未展示公司人数、注册资本、福利待遇等公司侧信息。

## 飞书导入

- 飞书 wiki token：`Fd5ow8skXiryp4kdQcScra0wnBg`
- Base token：`BzxLbGP1TaUDIcs7RKec7bwIn9b`
- 原始表：`数据表` / `tblCWWq6uoMcAg2C`
- 新导入表：`岗位池` / `tbl2J8PrdS7lRuuq`
- 新表视图：`表格` / `vew7iquz00`
- 新表链接：`https://my.feishu.cn/wiki/Fd5ow8skXiryp4kdQcScra0wnBg?table=tbl2J8PrdS7lRuuq&view=vew7iquz00`

导入方式：浏览器登录态打开飞书页面，通过页面“导入 Excel”入口导入本地 XLSX。CLI/MCP 的 bot 身份可读，但没有用户写入权限；用户身份 refresh token 已过期，因此写入使用网页登录态完成。

## 验证

使用 `/opt/homebrew/bin/lark-cli` bot 身份反查：

- `lark-cli doctor`：bot identity ready；user identity missing，refresh token expired。
- `base +table-list`：确认存在 `数据表` 和 `岗位池` 两张表。
- `base +field-list`：确认 `岗位池` 有 25 个字段。
- `base +record-list`：确认 `岗位池` 有 15 条记录、15 个 record_id。
- 抽样核对：首条为半岛医疗，末条为 LEAPZERO；职位链接、注册资本、福利待遇字段存在。

## 后续使用建议

后续用户反馈“符合 / 不符合 / 可参考”时，优先更新 `岗位池` 表里的 `初判状态` 与 `用户反馈` 字段。继续批量筛选时，可沿用本次字段结构。

## 2026-06-09 补充：地址与投递意愿

用户已在飞书 `用户反馈` 字段补充判断后，追加两列：

- `公司具体地点`
- `投递意愿`，单选项为 `无 / 低 / 中 / 高`

执行方式：

- 先用 BOSS 详情页逐条读取 `.location-address` / `工作地址` 区块。
- 第 9 条匿名猎头岗位未展示工作地址，保持为空。
- 使用 `lark-cli auth login --domain base,wiki` 重新完成用户授权；授权后用 user identity 创建字段并逐条 `record-upsert` 写回。
- 反查命令确认 `岗位池` 15 条记录均已写入新两列。

投递意愿初版来自用户反馈原文推断：

- `高`：8 明略科技
- `中`：2 龙品、4 Shopee、11 开源中国、14 超线性
- `低`：1 半岛医疗、3 纽尔、5 听好智能、6 恒丰汇金、7 镜玩科技、10 小红书、13 腾讯
- `无`：9 匿名大型互联网公司、12 Anker、15 LEAPZERO

本地补充备份：

- `docs/progress/artifacts/job-search/boss-ai-product-jobs-addresses-20260609.json`
- `docs/progress/artifacts/job-search/boss-ai-product-jobs-address-intention-20260609.json`

## 2026-06-09 补充：第二批 AI Agent / 大模型岗位

用户要求继续寻找更贴近 AI 产品经理经历的岗位后，按项目级 `job-search` skill 的偏好画像，新增采集第二批 10 条岗位，序号为 16-25。

采集关键词与方向：

- `大模型 产品经理`
- `AI Agent 产品经理`
- 优先保留 AI Agent、Workflow、Skills、Eval、电商 / 内容增长、AI Native 工具方向。
- 对匿名猎头、硬件 / 语音 / 纯技术负责人 / 过强算法协同岗位降权。

新增结果概览：

| 序号 | 公司 | 岗位 | 薪资 | 投递意愿 | 关键判断 |
| --- | --- | --- | --- | --- | --- |
| 16 | 同花顺 | AI产品经理（初级/中级/高级） | 20-35K·15薪 | 中 | 内容型 AI + LLM/workflow/Agent 可连接，但金融、学历/专业门槛明显 |
| 17 | 幻境游戏 | 大模型应用产品经理 | 20-35K·13薪 | 中 | 0-1 AI陪伴产品，产品职责清晰，但偏 C 端陪伴 / 游戏社交 |
| 18 | 熵基律动 | AI策略产品经理（大模型方向） | 20-25K | 低 | 大模型策略 / 算法协同较重，早期公司叙事偏宏大 |
| 19 | 某中型互联网金融上市公司（猎头代招） | AI产品经理（大模型应用） | 15-30K·17薪 | 低 | B 端 AI Native / Agent JD 不错，但匿名且金融垂直经验重 |
| 20 | 深圳市天裳科技 | AI Agent 产品经理 | 15-30K | 高 | Agent 工作流 + 电商内容 / 广告增长，和内容营销系统项目强相关 |
| 21 | Shoplazza | 资深 AI Agent 产品经理(A163332) | 30-60K·15薪 | 高 | 跨境电商 SaaS Agent / Skills / Eval 体系，和 Agent 项目叙事高度贴合 |
| 22 | 望船夫 | AI Agent 产品经理 | 20-30K·13薪 | 中 | JD 高度贴合 Workflow/Codex/Cursor/Dify，但 0-20 人未融资 |
| 23 | 深圳某中型知识产权风控公司（猎头代招） | ai产品经理/AI Agent 产品 深挖 B 端业务 | 20-40K | 低 | JD 贴 AI Native / Agent / B 端 0-1，但匿名猎头、6 年以上要求和信息缺失 |
| 24 | 南方网通 | AI Agent研发产品总监 | 15-20K | 无 | 要求 Java/PHP、SEO、带团队，实质偏技术负责人 / 营销建站 |
| 25 | 为爱觉醒 | AI agent 产品经理 | 20-40K·14薪 | 低 | AI 分身 / 教培疗愈可参考，但 5-10 年、早期公司、C 端 IP 陪伴方向偏离主线 |

飞书写入方式：

- 使用 `/opt/homebrew/bin/lark-cli` user identity。
- 首次 `record-batch-create` 失败，原因为 `岗位名称`、`公司名称`、`薪资`、`列表标签`、`福利待遇` 等字段是单选 / 多选字段，新增值不在字段选项中。
- 处理方式：先用 `base +field-update` 在原字段选项后追加本批需要的新选项，不改字段类型、不清空旧选项。
- 之后用 `base +record-batch-create` 成功创建 10 条记录。

验证结论：

- `record-batch-create` 返回 `ok: true`，生成 10 个 record id。
- `base +record-list` 反查确认序号 16-25 均存在，且 `投递意愿`、`公司具体地点`、`职位链接` 等字段已写入。
- 第 19、23 条为匿名猎头代招岗位，BOSS 详情页未展示真实公司、地址、注册资本和工商信息，相关字段保留为空或标注为猎头代招。

本地备份：

- `docs/progress/artifacts/job-search/boss-ai-product-jobs-batch2-raw.json`
- `docs/progress/artifacts/job-search/boss-ai-product-jobs-batch2-normalized.json`

## 2026-06-09 补充：多 subagent 扩池与搜索策略修正

用户反馈：当前只找七八个太少，真实筛岗应先捞大池子，可能从 100 个候选里挑；并指出 `大模型产品经理` 作为主搜词会跑偏，主入口应改成 `AI产品经理`，BOSS 推荐流只能作为补充。

执行调整：

- 将搜索主词改为 `AI产品经理`。
- 并行拆分多个采集方向：`AI产品经理`、`AI Agent / 智能体`、`AI应用 / AI Native / AI工具`、`电商 / 内容 / AI营销`。
- 另派一个策略复盘任务，专门审查关键词和快速排除规则。
- 将策略沉淀到项目级 skill：`.codex/skills/job-search/references/search-strategy.md`，并在 `.codex/skills/job-search/SKILL.md` 中要求新批次搜索前先读策略。

搜索策略结论：

- `AI产品经理`、`AI Agent 产品经理`、`Agent 产品经理`、`智能体 产品经理`、`AI Native 产品经理`、`AI应用产品经理`、`AI工具 产品经理`、`AI SaaS 产品经理`、`AI工作流 产品经理`、`AIGC 产品经理`、`AI营销 产品经理` 作为主搜索词。
- `大模型产品经理` 不再作为主入口，只保留 `大模型应用 产品经理` 这类应用层组合词。
- 列表页先建立 100+ 原始池；只有打开详情页、拿到 JD、公司规模、业务、福利、注册资本、地址和链接后，才写入飞书详情表。
- 硬件 / IoT / 语音音频 / 数据治理 / 算法训练 / RAG 工程 / Web3 交易 / 匿名猎头信息缺失继续强降权。

本轮 subagent 产出：

| 子任务 | 方向 | 列表候选 | 详情候选 | 产物 |
| --- | --- | ---: | ---: | --- |
| A | AI 产品经理主词 | 90 | 10 | `docs/progress/artifacts/job-search/subagent-a-ai-product-20260609.json` |
| B | Agent / 智能体方向 | 50 | 10 | `docs/progress/artifacts/job-search/subagent-b-agent-20260609.json` |
| C | AI 应用 / AI Native / AI 工具 | 48 | 10 | `docs/progress/artifacts/job-search/subagent-c-ai-app-native-20260609.json` |
| D | 电商 / 内容 / AI 营销 | 108 | 10 | `docs/progress/artifacts/job-search/subagent-d-ecom-marketing-20260609.json` |
| E | 搜索策略复盘 | - | - | `docs/progress/artifacts/job-search/subagent-e-search-strategy-20260609.md` |

## 2026-06-09 补充：第三到第六批飞书写入

在第二批 25 条基础上，继续从 subagent 详情候选中去重、初判并写入飞书 `岗位池`，当前序号扩展至 60。

新增批次：

- 第三批：序号 26-35，文件 `docs/progress/artifacts/job-search/boss-ai-product-jobs-batch3-normalized.json`。
- 第四批：序号 36-43，文件 `docs/progress/artifacts/job-search/boss-ai-product-jobs-batch4-from-subagent-b-normalized.json`。
- 第五批：序号 44-51，文件 `docs/progress/artifacts/job-search/boss-ai-product-jobs-batch5-from-subagent-d-normalized.json`。
- 第六批：序号 52-60，文件 `docs/progress/artifacts/job-search/boss-ai-product-jobs-batch6-from-subagents-a-c-normalized.json`。

新增高优先级样本包括：

| 序号 | 公司 | 岗位 | 投递意愿 | 关键判断 |
| --- | --- | --- | --- | --- |
| 36 | 极视角 | 智能体平台产品经理 | 中 | AI Agent 平台 / 工作流方向明确，偏平台型产品 |
| 37 | 云智达创 | 产品经理（AI 营销智能体） | 高 | AI 营销智能体，和内容营销系统叙事强相关 |
| 39 | 兔展 | AI Agent产品经理（AI视频方向） | 高 | Agent + AI 视频 / 内容生产方向强相关 |
| 44 | 歪麦 | 产品经理（本地生活O2O与AI智能体） | 高 | 本地生活增长 + Agent，业务场景清晰 |
| 52 | 深圳市逻辑控股科技 | AI产品经理-聚焦欧美AdTech/AIGC市场--双休 | 高 | AdTech / AIGC / 海外营销，贴内容增长 |
| 53 | 洞墟科技 | AI 产品经理（营销方向） | 高 | AI 营销方向明确 |
| 54 | 北京字跳网络技术 | AI工具产品经理（即梦）-剪映CapCut | 高 | AI 工具 / 创作产品大厂样本，适合作冲刺和标杆 |
| 55 | 深致智能 | AI 应用产品经理 | 高 | AI 应用产品职责明确，非纯算法岗 |
| 57 | 易希科技 | AI PM 产品经理 \| AI Product Manager | 高 | AI Native / 应用产品叙事较强 |
| 59 | 小影 | 产品经理（web端+AI） | 高 | AI 创作 / 视频工具方向，与作品集可连接 |
| 60 | 快歌智能 | 产品经理（AI工具/AI视频） | 高 | AI 工具 / AI 视频方向清晰 |

飞书写入与验证：

- 写入方式：`/opt/homebrew/bin/lark-cli` user identity。
- 写入表：`岗位池` / `tbl2J8PrdS7lRuuq`。
- 写入后使用 `base +record-list --as user --limit 260` 反查。
- 反查结果：60 条记录，最小序号 1，最大序号 60。
- 最后 8 条反查为序号 53-60，包含洞墟科技、北京字跳网络技术、深致智能、深圳市快起量网络科技、易希科技、豹亮科技、小影、快歌智能。

注意事项：

- 飞书部分字段为单选 / 多选，写入新岗位前需要先补字段选项；如果 `field-update` 返回 `no operation produced`，可能是选项已存在或 CLI/API 缓存显示不一致，应尝试实际写入并用 record-list 反查。
- 第六批中曾出现一条字段错位：`深致智能` 的 `融资阶段 / 公司人数 / 公司行业` 被列表解析错位；写入前已修正为 `公司人数=20-99人`、`公司行业=人工智能`，融资阶段留空。
- 列表候选池里存在 day-rate 实习、Web3/OTC、硬件、匿名猎头、高年限负责人等大量低匹配岗位，不应直接进入飞书详情表。

## 2026-06-09 补充：待详情化候选池

从多个 subagent 的列表候选中排除飞书现有 60 条后，整理出待详情化候选池：

- 文件：`docs/progress/artifacts/job-search/job-search-pending-list-candidates-20260609.json`
- 飞书已有详情记录：60
- 待详情化列表候选：134
- 初判分布：`中` 8 条，`低` 78 条，`无` 48 条。

当前优先可继续点详情的 `中` 候选：

| 公司 | 岗位 | 薪资 | 来源词 |
| --- | --- | --- | --- |
| 蓝青教育集团 | 智能体产品经理（Coze/Dify/FastGPT方向） | 10-15K | Dify 产品经理 |
| Shopee | 【实习】产品经理-内容生成策略（AIGC）-SZ | 290-300元/天 | 内容生成 产品经理 |
| 银河星尘 | AI产品经理（Agent/ Aigc） | 18-30K | AIGC产品 |
| 博思纵横 | AI 产品经理（商业化方向） | 20-40K·16薪 | AI工具产品经理 |
| 熵基律动 | AI产品经理（AI Agent B端） | 15-30K | AI产品 Agent |
| 百达屋 | AI产品/运营（AI Native） | 13-25K | AI Native 产品经理 |
| 深圳守正不出奇教育科技 | AI Native 技术产品负责人 / 全栈 Owner | 16-30K | AI Native 产品经理 |
| 光速动力 | AI产品经理 | 15-30K·13薪 | AI Native 产品经理 |

下一步建议：

1. 继续从待详情池的 `中` 候选开始点开详情页，补齐 JD、福利、注册资本、具体地址后写入飞书。
2. `低` 候选只在 `中` 池不足时补充，优先看 AI Agent / AI营销 / 电商内容方向。
3. `无` 候选保留作负样本和规则校准，不进入投递池。
4. 用户后续在飞书补充反馈后，优先更新 `.codex/skills/job-search/references/preference-profile.md`，再继续新一轮采集。

## 2026-06-09 补充：第七到第九批待详情池补全

用户提醒 Chrome 标签内存占用后，本轮改为小批量处理：每批只打开 4 个 BOSS 详情页，采集完成、写入飞书并反查后立即关闭本批标签。结束时检查 Chrome targets，只保留用户原有 BOSS 列表页。

处理结果：

- 第七批：序号 61-64，文件 `docs/progress/artifacts/job-search/boss-ai-product-jobs-batch7-normalized.json`。
- 第八批：序号 65-68，文件 `docs/progress/artifacts/job-search/boss-ai-product-jobs-batch8-normalized.json`。
- 第九批：序号 69-72，文件 `docs/progress/artifacts/job-search/boss-ai-product-jobs-batch9-normalized.json`。
- 更新后的待详情池：`docs/progress/artifacts/job-search/job-search-pending-list-candidates-after-72-20260609.json`。

新增详情记录：

| 序号 | 公司 | 岗位 | 薪资 | 投递意愿 | 关键判断 |
| --- | --- | --- | --- | --- | --- |
| 61 | 蓝青教育集团 | 智能体产品经理（Coze/Dify/FastGPT方向） | 10-15K | 低 | 智能体/Coze/Dify/FastGPT 贴合，但薪资低于目标且教育/G端/RAG技术要求偏重 |
| 62 | Shopee | 【实习】产品经理-内容生成策略（AIGC）-SZ | 290-300元/天 | 无 | AIGC内容生成有参考价值，但为实习岗且要求在读/985/算法评测 |
| 63 | 银河星尘 | AI产品经理（Agent/ Aigc） | 18-30K | 中 | Agent/AIGC产品全流程匹配；公司很早期，业务含医疗健康/IoT硬件 |
| 64 | 博思纵横 | AI 产品经理（商业化方向） | 20-40K·16薪 | 中 | 海外红人AI营销平台与内容增长系统强相关；但偏商业化运营且工商主体成立短 |
| 65 | 熵基律动 | AI产品经理（AI Agent B端） | 15-30K | 中 | Agent平台/工作流/工具生态贴合；公司2025年成立、未融资、注册资本100万 |
| 66 | 百达屋 | AI产品/运营（AI Native） | 13-25K | 中 | AI Native/AI Agent思维强；本质偏酒店/O2O集团内部AI转型，岗位产品/运营混合 |
| 67 | 深圳守正不出奇教育科技 | AI Native 技术产品负责人 / 全栈 Owner | 16-30K | 低 | Claude Code/Cursor/agent workflow 强贴合；但0-20人且技术全栈Owner压力高 |
| 68 | 光速动力 | AI产品经理 | 15-30K·13薪 | 中 | 企业级Agent OS、AI Agent和0-1产品生命周期强；风险是金融科技/合规/英语要求 |
| 69 | Fastlane | AIGC 产品专员(A55066) | 15-25K·13薪 | 中 | AI Agent内容创作、AIGC工作流、Prompt优化贴内容营销系统；但岗位偏产品专员/内容运营 |
| 70 | 六度人和 | AI SaaS产品经理 | 12-18K·13薪 | 中 | AI Agent & Skill重构电商获客/转化，SaaS/CRM/B2B背景强；薪资偏低 |
| 71 | TCL雷鸟科技 | AIGC产品经理 | 15-30K·18薪 | 高 | AIGC动态漫内容平台、生成工具、Prompt优化、创作者生态，值得重点看 |
| 72 | 能信安 | AI智能体产品经理 | 12-18K | 低 | 标题贴智能体，但信息安全垂直、985/211、大小周且薪资偏低 |

验证：

- `record-batch-create` 第 61-72 条均返回 `ok: true`。
- 第七批初次写入后发现飞书单选字段缓存导致 61、63、64 的少数字段为空，已用 `record-upsert` 按 record_id 补写。
- 最终 `record-list` 反查：`count=72`，最大序号 `72`；序号 61-72 的岗位名、公司名、薪资、投递意愿、具体地址均存在。
- Chrome targets 收尾检查：本轮详情页均已关闭，只保留用户原有 BOSS 列表页。

待详情池变化：

- 本轮前：飞书详情记录 60，待详情列表候选 134，其中 `中` 8、`低` 78、`无` 48。
- 本轮后：飞书详情记录 72，待详情列表候选 122，其中 `低` 74、`无` 48。
- 原本列表级 `中` 候选已全部详情化；后续继续扩池时，需要从 `低` 里优先挑 AI Agent / SaaS / AIGC / AI营销 / 内容工具方向，继续小批量验证。

## 2026-06-09 补充：第十批低池翻盘候选

本轮从 `job-search-pending-list-candidates-after-72-20260609.json` 的 `低` 候选里挑选可能翻盘的 AI Agent / SaaS / AIGC / AI营销 / 内容工具方向，仍按 Chrome/BOSS 小批量纪律处理：一次打开 4 个详情页，提取完成、写入飞书、反查通过后立即关闭本批详情页。

本地产物：

- 第十批详情备份：`docs/progress/artifacts/job-search/boss-ai-product-jobs-batch10-from-low-pending-normalized.json`。
- 更新后的待详情池：`docs/progress/artifacts/job-search/job-search-pending-list-candidates-after-76-20260609.json`。

新增详情记录：

| 序号 | 公司 | 岗位 | 薪资 | 投递意愿 | 关键判断 |
| --- | --- | --- | --- | --- | --- |
| 73 | 火把公司 | AI SaaS产品经理 | 30-55K | 中 | 3D AI创作平台/SaaS/开发者工具/复杂后台从0到1，和AI工具产品叙事相关；但公司业务仍有硬件、3D打印和跨境电商成分，岗位技术理解要求较强 |
| 74 | 东信时代 | 出海AI产品经理（出海AI视频生成平台） | 25-50K | 高 | AI营销视频生成平台、智能体、多模态内容、Prompt优化、模型评测、海外营销和跨境电商痛点都贴内容营销系统叙事；公司规模和业务完整度强 |
| 75 | 腾讯 | Agent产品经理——WorkBuddy | 20-40K·15薪 | 中 | WorkBuddy会话组件、Agent表达力和生态建设方向贴AI工具/工作流；但要求5年以上、成熟IM/邮件产品经验、RAG/Function Call/多Agent编排/编辑器技术理解 |
| 76 | 深圳光魔科技有限公司 | AI内容产品经理 | 25-50K·16薪 | 中 | AIGC内容创作故事引擎、创作者工具、Prompt引导、多轮交互、生成质量迭代贴内容工具叙事；但公司早期、偏AI陪伴/互动叙事/海外内容 |

飞书写入与验证：

- 写入方式：`/opt/homebrew/bin/lark-cli` user identity。
- 写入前使用 `field-search-options` 获取完整选项，再对 `岗位名称`、`公司名称`、`薪资`、`列表标签`、`福利待遇`、`企业类型` 追加缺失选项；避免直接用 `field-get` 的截断选项做 PUT。
- `record-batch-create` 返回 `ok: true`，新增 record id：`recvm32sLhmchj`、`recvm32sLhj00l`、`recvm32sLhf7DL`、`recvm32sLhu717`。
- `record-list` 反查：`count=76`，最大序号 `76`；序号 73-76 的岗位名、公司名、薪资、投递意愿、具体地址和 JD 均存在。
- 本批没有出现单选字段缓存导致的空字段，不需要 `record-upsert` 补写。
- Chrome targets 收尾检查：本批 4 个 BOSS 详情页均已关闭，只保留用户原有页面和原 BOSS 列表页。

待详情池变化：

- 本轮前：飞书详情记录 72，待详情列表候选 122，其中 `低` 74、`无` 48。
- 本轮后：飞书详情记录 76，待详情列表候选 118，其中 `低` 70、`无` 48。
- 只移除了本批 4 个精确 URL；同公司其他候选如腾讯智能营销/智能体策划、光魔陪伴APP角色chat方向仍保留在待详情池，未被误删。

## 2026-06-09 补充：第十一批低池翻盘候选

继续从 `低` 候选中挑 AI智能体 / AI营销方向做第二个小批次。本批同样只打开 4 个 BOSS 详情页，写入和反查完成后关闭标签。

本地产物：

- 第十一批详情备份：`docs/progress/artifacts/job-search/boss-ai-product-jobs-batch11-from-low-pending-normalized.json`。
- 更新后的待详情池：`docs/progress/artifacts/job-search/job-search-pending-list-candidates-after-80-20260609.json`。

新增详情记录：

| 序号 | 公司 | 岗位 | 薪资 | 投递意愿 | 关键判断 |
| --- | --- | --- | --- | --- | --- |
| 77 | 兆珑科技 | AI智能体产品经理 | 20-35K·13薪 | 中 | 工作流智能体、AI客服、AI营销、业务流程自动化方向明确；但公司主业是商业物联网/收银硬件及IoT解决方案，硬件业务风险明显 |
| 78 | 星源开物 | AI智能体产品经理 | 15-25K·14薪 | 低 | 知识付费/教育智能体和内容IP有一点内容工具关联；但公司2025年刚成立、未融资、教育/培训垂直明显，且要求知识付费教育产品经验和重大项目验收文档 |
| 79 | 鸿普森 | AI产品经理（智能体） | 18-25K | 低 | 企业级智能体应用和路线图/PRD职责有匹配点；但要求LangChain/LlamaIndex、技术架构、算法研发协作和企业级项目实施，公司业务还含大数据/数据治理/数字人/硬件交互 |
| 80 | 腾讯 | AI产品经理-智能营销(深圳) | 50-80K·15薪 | 中 | 智能营销、AI应用落地、模型应用效果和平台产品规划相关；但岗位偏数据/模型/算法协作，招聘者为算法专家，薪资异常高意味着门槛可能被低估 |

飞书写入与验证：

- 写入方式：`/opt/homebrew/bin/lark-cli` user identity。
- 写入前追加缺失选项：`岗位名称`、`公司名称`、`薪资`、`列表标签`、`福利待遇`、`公司行业`、`企业类型`。
- `record-batch-create` 返回 `ok: true`，新增 record id：`recvm34R5OkEji`、`recvm34R5OiZUs`、`recvm34R5OupYO`、`recvm34R5OJtzh`。
- `record-list` 反查：`count=80`，最大序号 `80`；序号 77-80 的岗位名、公司名、薪资、投递意愿、具体地址和 JD 均存在。
- 本批没有出现单选字段缓存导致的空字段，不需要 `record-upsert` 补写。
- Chrome targets 收尾检查：本批 4 个 BOSS 详情页均已关闭。

待详情池变化：

- 本轮前：飞书详情记录 76，待详情列表候选 118，其中 `低` 70、`无` 48。
- 本轮后：飞书详情记录 80，待详情列表候选 114，其中 `低` 66、`无` 48。
- 后续低池继续优先看：AI Agent / AI工具 / AIGC / AI营销 / 内容生成；对教育培训、数据治理、技术框架实施、IoT硬件背景继续强降权。

## 2026-06-09 补充：第十二到第十四批低池继续翻盘

用户要求继续多找。本轮从 `job-search-pending-list-candidates-after-80-20260609.json` 的低池里继续挑 AI Agent / AI SaaS / AIGC / AI营销 / 内容工具方向，排除明显 Web3/OTC、纯硬件、语音、实习、算法和纯负责人岗位。仍按小批量纪律执行：每批打开 4 个 BOSS 详情页，采集完成、写入飞书、反查通过后关闭本批详情页。

本地产物：

- 第十二到第十四批详情备份：`docs/progress/artifacts/job-search/boss-ai-product-jobs-batch12-14-from-low-pending-normalized.json`。
- 第十二批后待详情池：`docs/progress/artifacts/job-search/job-search-pending-list-candidates-after-84-20260609.json`。
- 第十三批后待详情池：`docs/progress/artifacts/job-search/job-search-pending-list-candidates-after-88-20260609.json`。
- 第十四批后待详情池：`docs/progress/artifacts/job-search/job-search-pending-list-candidates-after-92-20260609.json`。

新增详情记录：

| 序号 | 公司 | 岗位 | 薪资 | 投递意愿 | 关键判断 |
| --- | --- | --- | --- | --- | --- |
| 81 | 腾讯 | 智能体策划产品经理 | 30-60K·16薪 | 高 | IDE、AI开发者工具、Agentic Workflow、代码生成和低代码智能助手强贴合用户的 AI coding / Agent 项目叙事 |
| 82 | 深圳市晚睡晚起科技 | AI SaaS产品经理 | 20-25K | 低 | AI SaaS 和商业化方向相关，但公司很早期、注册资本 18 万且招聘者半年未活跃 |
| 83 | 视壮科技 | AIGC产品经理 | 20-35K·13薪 | 中 | AIGC 工具链和内容工业化相关，但公司主业偏智能硬件 / IoT，需降权 |
| 84 | 法狗狗 | 产品经理（AI SaaS） | 18-26K | 中 | AI SaaS 0-1、MVP、PMF、B端产品匹配，但法律 / 合规垂直明显 |
| 85 | 深度赋智 | Agent产品经理-技术/效果方向 | 25-50K·15薪 | 中 | MetaGPT / OpenManus / coding agents 强相关，但岗位偏技术效果、架构、RAG、向量库和 Function Calling |
| 86 | 深圳智子芯元科技 | 高级AI产品经理（桌面智能体方向-C端） | 20-40K·16薪 | 中 | 桌面智能体 C 端方向相关，但公司核心是 AI + 数学 / HPC / 芯片算子自动化，硬科技色彩重 |
| 87 | 雷特科技 | AIGC产品经理 | 25-40K·13薪 | 高 | AI创作工具 Web 端、AIGC 视频 / 图像、内容工业化和跨境电商内容生产高度贴合 |
| 88 | 腾讯 | AIGC智能产品经理 | 20-40K·15薪 | 中 | AIGC / chatbot / 模型产品在商业业务落地，方向相关但岗位描述偏通用和内部业务 |
| 89 | 信诚未来 | AI-Agent产品专家（年终奖） | 40-70K·13薪 | 高 | Dify / n8n / Coze / Claude-Code、AI-Agent 增长运营复制和跨境电商业务流程改造强贴合 |
| 90 | 深圳市方弘科技 | AIGC 产品经理 | 45-60K | 低 | AIGC 视觉特效 / 风格效果相关，但高年限、游戏行业、公司信息缺失且落点偏视觉效果验收 |
| 91 | 潮隐人工智能 | ai产品经理 | 25-50K·15薪 | 中 | AI数字员工 SaaS、B2B 外贸、Agent、自动化流程和 AI Native UX 相关，但偏 UX / 交互且公司较早期 |
| 92 | 跨信通 | 产品经理（履约与AI应用） | 20-30K | 中 | Skill / Agent / Workflow / Tools、Demo / API 和业务流程 AI 应用相关，但垂直在跨境财税合规与 ERP 履约 |

飞书写入与验证：

- 写入方式：`/opt/homebrew/bin/lark-cli` user identity。
- 第十二批 `record-batch-create` 返回 `ok: true`，新增 record id：`recvm39fIqOVP1`、`recvm39fIq5Wrd`、`recvm39fIqinPj`、`recvm39fIqQzGY`；反查 `count=84`，最大序号 `84`。
- 第十三批 `record-batch-create` 返回 `ok: true`，新增 record id：`recvm3ae1hH9F7`、`recvm3ae1hvEEv`、`recvm3ae1hUX3p`、`recvm3ae1hy8G4`；反查 `count=88`，最大序号 `88`。
- 第十四批 `record-batch-create` 返回 `ok: true`，新增 record id：`recvm3bfiDAeyT`、`recvm3bfiDl25O`、`recvm3bfiD3y1Q`、`recvm3bfiDYfo1`；反查 `count=92`，最大序号 `92`。
- 序号 81-92 的岗位名、公司名、薪资、投递意愿、公司具体地点和 JD 均存在；本轮没有发现单选字段缓存导致的空字段，不需要 `record-upsert` 补写。

待详情池变化：

- 本轮前：飞书详情记录 80，待详情列表候选 114，其中 `低` 66、`无` 48。
- 第十二批后：飞书详情记录 84，待详情列表候选 110。
- 第十三批后：飞书详情记录 88，待详情列表候选 106。
- 第十四批后：飞书详情记录 92，待详情列表候选 102，其中 `低` 54、`无` 48。
- 本轮只移除 12 个已写入飞书的精确 BOSS 职位 URL；同公司其他候选仍保留，避免误删。

Chrome 标签状态：

- 每批采集后均关闭本批 4 个 BOSS 详情页。
- 本轮结束时通过 web-access CDP proxy 检查 Chrome targets，未发现遗留 `zhipin.com/job_detail` 详情页。

## 2026-06-09 补充：深圳高成长公司反查

用户要求从瞪羚云和 IT桔子反向找深圳领头羊、独角兽/中厂公司，并补充公司老板背景和融资情况。本轮未向飞书岗位池新增记录，因为这是公司研究，不是 BOSS JD 详情采集。

本地产物：

- 人读版报告：`docs/progress/2026-06-09-shenzhen-itjuzi-company-reverse-research.md`
- 结构化 JSON：`docs/progress/artifacts/job-search/shenzhen-itjuzi-company-reverse-research-20260609.json`

关键结论：

- 优先反查岗位：小鹅通、追一科技、软牛科技、行云集团、inSai Hilight营赛。
- 中等优先：货拉拉、云网万店、KLOOK、夸夸菁领、湾驱人工智能、幻影未来。
- 明确降权：大疆、荣耀、引望智能、微众银行、百麒晟、水杉智算、趣推。
- IT桔子普通账号存在限制：独角兽地区筛选和翻页需要 VIP；生成式 AI 专题关键词 `深圳` 可看第一页 50 家，总数 65，第二页需要 VIP。

## 2026-06-10 补充：公司池与第一批 BOSS 反查

按用户新的“公司优先”策略，已新建飞书 `公司池` 表并写入 19 家从瞪羚云 / IT桔子筛出的深圳及广东高成长公司。

飞书状态：

- `公司池` / `tblyV8V8UzqT8wMN`，视图 `vewOYgf8o6`，当前 19 条。
- 原 `岗位池` / `tbl2J8PrdS7lRuuq` 本轮未新增岗位，反查仍为 `count=92`，`maxSeq=92`。

首批已反查并写回 `公司池` 的公司：

| 公司 | BOSS反查状态 | 核心结论 |
| --- | --- | --- |
| 小鹅通 | 暂无匹配岗位 | 当前可见岗位偏销售 / 客户经理，不写入岗位池 |
| 追一科技 | 有匹配岗位 | 发现 3 条 AI 产品经理线索，CTO 在线招聘版本优先 |
| 软牛科技 | 有匹配岗位 | 有 AI影像 / AIGC 工具产品岗位，B端高级产品经理最值得继续 |
| 行云集团 | 暂无匹配岗位 | 当前只看到出海合规产品、董事长助理、PMO 等，不是 AI 产品 |
| inSai Hilight营赛 | 官网投递优先 | BOSS 当前 0 职位，但方向高度贴 AI-native 电商视频 / 多智能体营销 |

详情见：

- `docs/progress/2026-06-10-company-pool-boss-reverse-search.md`
- `docs/progress/artifacts/job-search/company-pool-boss-reverse-batch1-20260610.json`

## 2026-06-10 补充：公司反查岗位写入 93-109

继续按“公司优先”策略，从公司池反向查 BOSS 岗位，并把详情岗位写入原 `岗位池`。

飞书状态：

- `公司池` / `tblyV8V8UzqT8wMN`：19 条，状态分布为 `有匹配岗位` 7、`暂无匹配岗位` 10、`官网投递优先` 1、`待继续` 1。
- `岗位池` / `tbl2J8PrdS7lRuuq`：新增 17 条，序号 93-109。
- 写入后反查：`count=109`，`maxSeq=109`。
- 本轮新增投递意愿：`高` 3、`中` 8、`低` 6、`无` 0。

新增详情记录：

| 序号 | 公司 | 岗位 | 薪资 | 投递意愿 |
| --- | --- | --- | --- | --- |
| 93 | 追一科技 | AI产品经理（英文好+AI项目经验） | 15-30K | 中 |
| 94 | 追一科技 | AI产品经理（英文好+AI项目经验） | 15-25K | 高 |
| 95 | 追一科技 | ai产品经理 | 11-20K | 低 |
| 96 | 软牛科技集团 | 影像产品经理(需提供作品集） | 8-12K | 低 |
| 97 | 软牛科技集团 | 高级产品经理（B端影像产品） | 20-40K | 中 |
| 98 | 湾驱人工智能 | AI产品经理 | 8-10K | 低 |
| 99 | 幻影未来 | AI 产品经理（供应链与贸易合规） | 12-20K | 中 |
| 100 | 幻影未来 | AI产品经理 | 10-15K | 低 |
| 101 | 幻影未来 | 高级Agent产品经理 | 30-45K | 中 |
| 102 | 货拉拉科技 | AI产品运营 | 15-20K·13薪 | 中 |
| 103 | 喜茶 | AI资深产品经理（知识库/RAG相关）-深圳 | 20-40K·14薪 | 中 |
| 104 | 喜茶 | 零售AI应用产品经理 | 30-50K·14薪 | 高 |
| 105 | 喜茶 | AI应用产品策划 | 30-50K·14薪 | 高 |
| 106 | 喜茶 | AI产品策划（中台方向） | 30-50K·13薪 | 中 |
| 107 | 喜茶 | AI产品负责人（Agent应用方向） | 40-60K·14薪 | 中 |
| 108 | 鹏劳人力（外派微众银行） | AI产品经理 | 10-14K | 低 |
| 109 | 微众银行 | AI数据产品经理 | 30-35K | 低 |

喜茶校正：

- 初次只按公司名 `喜茶HEYTEA` 搜索时，前几屏未显示 AI 产品岗。
- 用户提醒后改搜 `喜茶 AI产品经理`、`喜茶 AI 产品经理`、`HEYTEA AI产品经理`，确认有多条 AI 产品岗位。
- 结论：公司反查后续采用“两步法”：先搜公司名看全量岗位，再用 `公司名 + AI / Agent / 产品经理 / AIGC` 二次收窄。

验证：

- 写入前已补齐飞书单选 / 多选字段选项，包括喜茶、微众、岗位名、薪资、标签、公司行业等。
- 103-107、108-109 均用 `record-list` 字段投影反查，岗位名、公司名、薪资、城市、经验、学历、标签、行业、地址和职位链接均完整。
- 本轮结束时通过 CDP 检查，已关闭所有 `zhipin.com` 标签。

本地产物：

- `docs/progress/2026-06-10-company-pool-boss-reverse-search.md`
- `docs/progress/artifacts/job-search/company-pool-boss-reverse-completed-20260610.json`

## 2026-06-10 补充：字段语义纠偏

用户指出：`用户反馈` 是用户本人后续写入的反馈列，AI 的岗位判断应写入 `初判状态`，不能把 AI 判断写进 `用户反馈`。

反查发现：

- 受影响范围：序号 61-102，共 42 条。
- 错误状态：`初判状态` 写成 `待用户标注`，AI 判断文本写入了 `用户反馈`。
- 处理方式：将 61-102 的 AI 判断移入 `初判状态`，并按该行 `投递意愿` 补上 `高 / 中 / 低 / 无` 前缀；将 `用户反馈` 清空。

修复验证：

- 61-102 共 42 条，`用户反馈` 非空数为 0。
- 61-102 共 42 条，`初判状态` 中 `待用户标注` 或空值数量为 0。
- 修复后意愿分布：`高` 6、`中` 24、`低` 11、`无` 1。
- 全表反查仍为 `count=109`、`maxSeq=109`。

顺手修复：

- 反查时发现 61-68 有部分 `岗位名称` / `公司名称` 单选字段为空，是早前飞书选项缓存导致的脏数据。
- 已补齐缺失选项并回填：
  - 61 蓝青教育集团 / 智能体产品经理（Coze/Dify/FastGPT方向）
  - 63 银河星尘 / AI产品经理（Agent/ Aigc）
  - 64 博思纵横 / AI 产品经理（商业化方向）
  - 65 熵基律动 / AI产品经理（AI Agent B端）
  - 66 百达屋 / AI产品/运营（AI Native）
  - 67 深圳守正不出奇教育科技 / AI Native 技术产品负责人 / 全栈 Owner
  - 68 光速动力 / AI产品经理

后续约束：

- `初判状态`：AI 根据 job-search skill 规则写入的岗位判断。
- `投递意愿`：AI 给出的 `无 / 低 / 中 / 高` 等级。
- `用户反馈`：只保留用户本人反馈，不再由 AI 写入。

## 2026-06-10 补充：新增打招呼术语列

用户要求为每个岗位补一段可直接发给招聘者的 BOSS 打招呼话术，不是单句模板。额外要求：前约 20 个字要适合 IM 列表预览，先露出作品集和方向命中点，吸引招聘者点开；但不能虚构经历。

处理结果：

- 新增字段：`打招呼术语`，字段 id `fldWFE73Pj`，类型 `text`。
- 写入范围：`岗位池` / `tbl2J8PrdS7lRuuq` 全量 109 条，序号 1-109。
- 写入方式：逐条 `record-upsert`，只更新 `打招呼术语` 一列，不触碰 `用户反馈`。
- 反查结果：`count=109`，`maxSeq=109`，`打招呼术语` 填充 109/109，空值 0。
- `用户反馈` 反查仍为 15 条非空，均是用户原本在 1-15 写入的反馈；本轮没有新增或覆盖用户反馈。

文案设计：

- 开头按岗位类型区分，但统一采用自然的个人网站表达，例如 `这是我的作品集网站，有Agent项目`、`这是我的作品集网站，有内容营销系统`、`这是我的作品集网站，有AI落地项目`。
- 明确废弃 `Agent作品集`、`AI营销作品集`、`AI Coding作品集`、`门店AI作品集`、`作品集在这` 等生硬前缀；这些表达会把个人网站误包装成一个临时拼出来的专题，语感不自然。
- 所有文案都在前段放入个人网站 `https://2young.xin/`。
- 真实依据来自用户确认后的口径：智蛙面试 / AI 学习伴侣、AI 内容营销系统、KeploreAI 的 Agent 产品经历、Codex / Claude Code 与 Harness Engineering 实践等。
- 对微众 / 金融、硬件、教育、门店、AIGC、Agent、开发者工具等岗位做了不同模板，不把低匹配风险写进发给招聘者的话术；风险仍保留在 `初判状态`。

二次修订：

- 首版前缀 `AI营销作品集在这`、`Agent作品集在这`、`门店AI作品集在这` 被用户指出语感生硬。
- v2 改成 `作品集在这，有...` 后，用户继续指出 `作品集在这` 也不自然。
- 最终 v3 改成 `这是我的作品集网站，有...`，并覆盖写入全量 109 条。
- v3 反查结果：`count=109`，`maxSeq=109`，`打招呼术语` 填充 109/109，旧前缀残留 0，`用户反馈` 仍为原 15 条非空。

三次修订：

- 用户继续指出：不能把简历或内部理解里的内容泛化成 `网站里放了...`，例如 `KeploreAI Agent`、`Codex Agent Harness` 和 `ToB 定向音响 MVP / 扫码用机` 这类表达会造成事实或语感问题。
- v4 依据用户补充口径重写：教育类强调用户访谈、专业老师访谈、提取申论批改流程并转成 AI 工作流、数据指标、good case / bad case、Dify 评测优化 skill；营销类强调 0-1 营销 Agent、上下文工程、工具调用、意图识别、权限控制、产品原型和客户需求沟通；AI coding 类保留 `Harness Engineering` 英文并解释 Codex / Claude Code、skill、sub-agent 和验收流程能力。
- 明确不再默认使用 ToB 定向音响 / 扫码用机 / 线上内容管理作为打招呼卖点，即使硬件岗也不主动夸大实习经历。
- v4 反查结果：`count=109`，`maxSeq=109`，`打招呼术语` 填充 109/109，禁用表达残留 0（`里面放了`、`ToB 定向音响`、`扫码用机`、`Codex Agent Harness`、`KeploreAI Agent`、默认 `AI 剪辑` 均未出现），`用户反馈` 仍为原 15 条非空。

本地产物：

- `docs/progress/artifacts/job-search/jobpool-greetings-20260610.json`
- `docs/progress/artifacts/job-search/greeting-copy-evidence-library-20260610.md`

## 2026-06-10 补充：BOSS 收藏岗位导入岗位池

用户要求：将 BOSS 上已收藏 / 感兴趣的岗位导入飞书 `岗位池`，并将这些岗位的 `投递意愿` 全部标为 `高`。

采集入口：

- 使用 web-access / CDP 进入 BOSS 个人中心 `感兴趣` tab。
- 页面显示 `感兴趣 71`，其中 web 端 `职位收藏` 实际可见 5 页，共 68 条职位；未见剩余 3 条职位，可能属于公司收藏、历史不可见项或 BOSS web 端不展示的数据。
- 采集方式遵循小批量：新增详情页按每批最多 4 个打开、抽取后立即关闭。

去重与写入结果：

- 写入前飞书 `岗位池` 反查：`count=109`，`maxSeq=109`。
- BOSS 可见收藏职位 68 条：
  - 5 条已存在于岗位池，未重复新增，只更新为 `投递意愿=高`。
  - 63 条为新增岗位，写入序号 110-172。
- 已更新的既有行：
  - 23 `ai产品经理/AI Agent 产品 深挖 B 端业务`
  - 37 `产品经理（AI 营销智能体）`
  - 38 `AI Native全栈产品经理`
  - 85 `Agent产品经理-技术/效果方向`
  - 107 `AI产品负责人（Agent应用方向）`
- 新增行统一写入 `投递意愿=高`；`初判状态` 中注明 `用户 BOSS 收藏，按要求将投递意愿标为高`，并保留岗位风险判断。
- `用户反馈` 列未写入、未覆盖。

详情页异常：

- Dify / `产品经理`：从收藏列表重新点击并获取新 securityId 后，BOSS 仍返回 `您访问的页面不存在`。
- 已作为序号 143 写入岗位池，保留收藏列表信息；`JD` 字段明确写入“详情页不可访问”，未编造 JD、工商和地址。
- 其余 62 条新增岗位均成功读取 JD；Point One 首次因 JD 内含 `【公司介绍】` 导致 fallback 截断，已二次重试修复，最终 JD 长度 1343 字符。

飞书字段选项：

- 写入前先用 `field-search-options` 分页读取完整选项，避免 `field-get` 只返回 50 个选项导致全量 PUT 截断旧选项。
- 追加选项成功的字段：
  - `岗位名称` +47
  - `公司名称` +40
  - `薪资` +32
  - `城市` +2（北京、上海）
  - `列表标签` +9（本轮改为稳定的 `经验 / 学历`，不再从 JD 正文标题里抽取脏标签）
  - `福利待遇` +27
  - `公司行业` +2
  - `企业类型` +4

验证：

- 新增记录分 7 批 `record-batch-create` 写入：110-119、120-129、130-139、140-149、150-159、160-169、170-172，均返回 `ok=true`。
- 写入后反查：`count=172`，`maxSeq=172`。
- 投递意愿分布：`高` 90、`中` 42、`低` 30、`无` 10。
- 新增 110-172 共 63 条核心字段反查无空值：`投递意愿`、`岗位名称`、`公司名称`、`薪资`、`城市`、`经验`、`学历`、`JD`、`职位链接`、`打招呼术语` 均存在。
- 已有 5 条收藏重复行反查均为 `投递意愿=高`。
- 任务结束时 CDP 检查：Chrome 中 `zhipin.com` 标签数为 0，已关闭本轮创建的 BOSS 标签。

本地产物：

- `docs/progress/artifacts/job-search/boss-interest-list-visible-20260610.json`
- `docs/progress/artifacts/job-search/boss-interest-new-details-20260610.json`
- `docs/progress/artifacts/job-search/boss-interest-feishu-rows-20260610.json`
