type VideoChainTestDraftEnv = {
  NODE_ENV?: string;
  VIDEO_CHAIN_TEST_ENTRYPOINT_ENABLED?: string;
};

type VideoChainTestDraftInput = {
  merchantName: string;
  serviceItems: string[];
  defaultCta: string[];
  forbiddenWords: string[];
  now?: string;
};

export function isVideoChainTestDraftEnabled(
  env: VideoChainTestDraftEnv = process.env,
): boolean {
  const explicitFlag = normalizeBooleanFlag(env.VIDEO_CHAIN_TEST_ENTRYPOINT_ENABLED);

  if (explicitFlag !== null) {
    return explicitFlag;
  }

  return env.NODE_ENV !== "production";
}

export function buildVideoChainTestDraftFixture(input: VideoChainTestDraftInput) {
  const now = input.now ?? new Date().toISOString();
  const cta = firstNonEmpty(input.defaultCta) ?? "";
  const service = firstNonEmpty(input.serviceItems) ?? "";
  const forbiddenWords = input.forbiddenWords.filter(Boolean);
  const todayTheme = service ? `${service}今日内容` : "今日内容拍摄任务";
  const title = `今日视频：${todayTheme}`;
  const scriptText = [
    `今日内容脚本：围绕「${todayTheme}」拍一条 35 秒左右的竖屏视频，先用真实场景建立信任，再给出一个低压力行动入口。`,
    "",
    "Scene 1 | 00:00-00:05",
    `画面：上传的第一段团队素材，优先展示${input.merchantName}的真实环境或人物动作。`,
    `台词：今天先带你看一个很多人容易忽略的细节，判断${service || "这个项目"}值不值得继续了解。`,
    "字幕：今日内容开场",
    "",
    "Scene 2 | 00:05-00:18",
    `画面：上传的第二段团队素材，${service ? `展示${service}相关细节。` : "展示团队已准备好的今日内容素材。"}`,
    "台词：不要只看单个卖点，要把预算、使用场景和后续沟通成本放在一起判断。",
    "字幕：核心判断方法",
    "",
    "Scene 3 | 00:18-00:35",
    "画面：上传的第三段团队素材或今日补充镜头，收束到人物口播或项目关键画面。",
    `台词：如果你也在纠结要不要进一步了解，可以把自己的情况发过来，我们先做一次轻量判断。${cta}`,
    "字幕：私信获取今日建议",
  ].join("\n");

  return {
    sourceItem: {
      platform: "douyin" as const,
      title,
      scriptText,
      tracePayload: {
        test_mode: "video_chain_bypass_script",
        created_at: now,
        purpose: "validate_video_upload_generation_revision_chain",
      },
    },
    draft: {
      workingTitle: title,
      rewriteGoal: "今日内容视频脚本，承接成员端素材上传、AI 剪辑和成片预览链路",
      status: "review_pending" as const,
      inputSnapshot: {
        source: "video_workbench_test_entrypoint",
        generationMode: "video_chain_test_bypass",
        scriptBypass: true,
        createdAt: now,
        merchantName: input.merchantName,
        serviceItems: input.serviceItems,
        forbiddenWords,
      },
      commentInsights: {
        testMode: "video_chain_bypass_script",
        validationTargets: [
          "media_upload",
          "video_edit_job_creation",
          "worker_generation",
          "preview_result",
          "production_revision",
        ],
      },
    },
    variant: {
      platform: "douyin" as const,
      variantType: "video_script" as const,
      title,
      scriptText,
      hashtags: ["今日内容", "团队素材", service || input.merchantName],
      ctaText: cta || null,
      reviewStatus: "approved" as const,
      productionScenes: [
        {
          sceneNo: 1,
          timeRange: "00:00-00:05",
          shotRequirement: "使用第一段团队素材，优先选择人物出镜或真实环境开场。",
          visual: `${input.merchantName}真实环境、人物动作或今日团队素材。`,
          voiceover: `今天先带你看一个很多人容易忽略的细节，判断${service || "这个项目"}值不值得继续了解。`,
          subtitle: "今日内容开场",
          materials: ["第一段团队素材"],
          cameraMovement: "固定机位或轻微推进",
          purpose: "建立真实感和今日主题",
          fallbackShot: "没有匹配素材时使用清晰的门头、空间或人物口播画面补位。",
        },
        {
          sceneNo: 2,
          timeRange: "00:05-00:18",
          shotRequirement: "使用第二段团队素材，展示今日主题对应的项目、服务或场景细节。",
          visual: service ? `${service}相关细节或今日团队素材。` : "团队已准备好的今日内容素材。",
          voiceover: "不要只看单个卖点，要把预算、使用场景和后续沟通成本放在一起判断。",
          subtitle: "核心判断方法",
          materials: ["第二段团队素材"],
          cameraMovement: "中景切近景",
          purpose: "讲清用户判断标准",
          fallbackShot: "素材不足时复用第一段素材，并用字幕补充关键信息。",
        },
        {
          sceneNo: 3,
          timeRange: "00:18-00:35",
          shotRequirement: "使用第三段团队素材或补充镜头，收束到低压力咨询入口。",
          visual: "第三段团队素材、收尾画面或今日补充镜头。",
          voiceover: `如果你也在纠结要不要进一步了解，可以把自己的情况发过来，我们先做一次轻量判断。${cta}`,
          subtitle: "私信获取今日建议",
          materials: ["第三段团队素材"],
          cameraMovement: "固定机位",
          purpose: "承接私信转化",
          fallbackShot: "没有第三段素材时使用人物口播或项目信息页补位。",
        },
      ],
    },
  };
}

function normalizeBooleanFlag(value: string | undefined): boolean | null {
  if (value === undefined) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return null;
}

function firstNonEmpty(values: string[]) {
  return values.find((value) => value.trim().length > 0)?.trim() ?? null;
}
