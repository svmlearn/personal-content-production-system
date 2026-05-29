"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  Film,
  Loader2,
  Maximize2,
  Mic,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
  PlayCircle,
  Radio,
  RefreshCw,
  Send,
  Sparkles,
  Square,
  UploadCloud,
  Video,
  Volume2,
  Wand2,
} from "lucide-react";

import type { ConsultationSessionDetailDto } from "@/contracts/consultation";
import type { ContentDraftBundleDto, VideoScriptSceneDto } from "@/contracts/draft";
import type { MaterialLibraryItemDto } from "@/contracts/material";
import type { PublicVideoEditJobDto, VideoEditProgressModuleDto } from "@/contracts/video";
import { isVideoEditJobInFlightStatus } from "@/contracts/video";
import type { VoiceProfileDto } from "@/contracts/voice";
import {
  buildVideoJobStatusCopy,
  type VideoJobStatusCopyTone,
} from "@/lib/ui/video-job-status-copy";
import {
  clearVideoWorkbenchSnapshot,
  mergeRouteContext,
  readRouteContextFromDraftInputSnapshot,
  readVideoWorkbenchSnapshot,
  type VideoWorkbenchChatMessage,
  type VideoWorkbenchRouteContext,
  writeVideoWorkbenchSnapshot,
} from "@/lib/ui/video-workbench-state";
import {
  type DraftMediaUploadStage,
  type DraftMediaAsset,
  formatAssetSize,
  uploadDraftMediaFile,
  uploadVoiceProfileAudioFile,
} from "@/lib/ui/video-workflow";

type ApiErrorPayload = {
  code?: string;
  message?: string;
  details?: {
    questions?: string[];
    missingFields?: string[];
    [key: string]: unknown;
  };
};

type VideoWorkbenchAgentResponse = {
  assistantMessage?: string;
  draftBundle?: ContentDraftBundleDto | null;
  selectedVariant?: ContentDraftBundleDto["selectedVariant"] | null;
  toolApplied?: boolean;
  toolMode?: "create" | "revise" | null;
  changeSummary?: string | null;
  error?: ApiErrorPayload;
};

type SegmentUploadState = {
  status: "uploading" | "uploaded" | "failed";
  progressPct: number;
  stage?: DraftMediaUploadStage;
  fileName?: string;
  asset?: DraftMediaAsset;
  error?: string;
};

type VoiceoverMode = "system" | "voice_profile";

type VoiceProfileCreateState = {
  displayName: string;
  authorizationAccepted: boolean;
  fileName?: string;
  status: "idle" | "recording" | "uploading" | "creating" | "ready" | "failed";
  progressPct: number;
  stage?: DraftMediaUploadStage;
  profile?: VoiceProfileDto;
  error?: string;
};

export function VideoWorkbench({
  sessionId,
  dailyTaskId,
  source,
  calendarItemId,
  draftId,
  variantId,
  jobId,
  materialId,
  materialReferenceId,
  strategyTag,
}: {
  sessionId?: string | null;
  dailyTaskId?: string | null;
  source?: string | null;
  calendarItemId?: string | null;
  draftId?: string | null;
  variantId?: string | null;
  jobId?: string | null;
  materialId?: string | null;
  materialReferenceId?: string | null;
  strategyTag?: string | null;
}) {
  const [routeContext, setRouteContext] = useState<VideoWorkbenchRouteContext>({
    sessionId: sessionId ?? null,
    dailyTaskId: dailyTaskId ?? null,
    source: source ?? null,
    calendarItemId: calendarItemId ?? null,
    draftId: draftId ?? null,
    variantId: variantId ?? null,
    jobId: jobId ?? null,
    materialId: materialId ?? null,
    materialReferenceId: materialReferenceId ?? null,
    strategyTag: strategyTag ?? null,
  });
  const [session, setSession] = useState<ConsultationSessionDetailDto | null>(null);
  const [referenceMaterial, setReferenceMaterial] = useState<MaterialLibraryItemDto | null>(null);
  const [goal, setGoal] = useState("");
  const [extraRequirement, setExtraRequirement] = useState("");
  const [draftBundle, setDraftBundle] = useState<ContentDraftBundleDto | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(variantId ?? null);
  const [job, setJob] = useState<PublicVideoEditJobDto | null>(null);
  const [loadingSession, setLoadingSession] = useState(Boolean(sessionId));
  const [generating, setGenerating] = useState(false);
  const [approvingScript, setApprovingScript] = useState(false);
  const [creatingJob, setCreatingJob] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [showCanvas, setShowCanvas] = useState(true);
  const [canvasExpanded, setCanvasExpanded] = useState(false);
  const [segmentUploads, setSegmentUploads] = useState<Record<number, SegmentUploadState>>({});
  const [voiceoverMode, setVoiceoverMode] = useState<VoiceoverMode>("system");
  const [systemVoiceProvider, setSystemVoiceProvider] = useState("aliyun_cosyvoice");
  const [systemVoiceSpeaker, setSystemVoiceSpeaker] = useState("longanyang");
  const [includeOriginalAudio, setIncludeOriginalAudio] = useState(false);
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfileDto[]>([]);
  const [selectedVoiceProfileId, setSelectedVoiceProfileId] = useState("");
  const [loadingVoiceProfiles, setLoadingVoiceProfiles] = useState(false);
  const [voiceProfileCreate, setVoiceProfileCreate] = useState<VoiceProfileCreateState>({
    displayName: "",
    authorizationAccepted: false,
    status: "idle",
    progressPct: 0,
  });
  const [messages, setMessages] = useState<VideoWorkbenchChatMessage[]>(
    buildInitialMessages(strategyTag ?? null),
  );

  async function loadSession(nextSessionId: string) {
    setLoadingSession(true);
    setError(null);

    try {
      const response = await fetch(`/api/consultation/sessions/${nextSessionId}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        session?: ConsultationSessionDetailDto;
        error?: { message?: string };
      };

      if (!response.ok || !data.session) {
        throw new Error(data.error?.message ?? "咨询上下文加载失败");
      }

      const loadedSession = data.session;
      setSession(loadedSession);
      setGoal(
        (current) => current || loadedSession.strategySnapshot.videoBrief?.hook || loadedSession.summaryText || "",
      );
      setMessages((current) =>
        appendAgentMessage(current, `已读取咨询策略：${
          loadedSession.strategySnapshot.videoBrief?.workingTitle ??
          loadedSession.strategySnapshot.currentSuggestion ??
          "视频脚本任务"
        }。右侧画布会根据后续对话实时沉淀脚本结构。`),
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "咨询上下文加载失败");
    } finally {
      setLoadingSession(false);
    }
  }

  async function loadReferenceMaterial(nextMaterialId: string) {
    try {
      const response = await fetch("/api/materials", {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        materials?: MaterialLibraryItemDto[];
        error?: { message?: string };
      };

      if (!response.ok) {
        throw new Error(data.error?.message ?? "参考素材加载失败");
      }

      const material = data.materials?.find((item) => item.id === nextMaterialId) ?? null;
      setReferenceMaterial(material);

      if (material) {
        setMessages((current) =>
          appendAgentMessage(
            current,
            `已带入参考素材「${material.title}」。我会优先借鉴它的开头钩子、镜头结构和转化动作。`,
          ),
        );
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "参考素材加载失败");
    }
  }

  async function loadDraftBundle(nextDraftId: string) {
    try {
      const response = await fetch(`/api/content/records/${nextDraftId}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        draftBundle?: ContentDraftBundleDto;
        error?: { message?: string };
      };

      if (!response.ok || !data.draftBundle) {
        throw new Error(data.error?.message ?? "脚本草稿加载失败");
      }

      const loadedDraftBundle = data.draftBundle;
      const restored = readRouteContextFromDraftInputSnapshot(loadedDraftBundle.draft.inputSnapshot);
      const routeVariant =
        routeContext.variantId &&
        loadedDraftBundle.variants.some((variant) => variant.id === routeContext.variantId)
          ? routeContext.variantId
          : null;
      const fallbackVariantId =
        loadedDraftBundle.selectedVariant?.id ??
        loadedDraftBundle.draft.selectedVariantId ??
        loadedDraftBundle.variants[0]?.id ??
        null;

      setDraftBundle(loadedDraftBundle);
      setSelectedVariantId(
        (current) => {
          if (current && loadedDraftBundle.variants.some((variant) => variant.id === current)) {
            return current;
          }

          return routeVariant ?? fallbackVariantId;
        },
      );
      setGoal((current) => current || loadedDraftBundle.draft.rewriteGoal || "");
      if (restored.extraRequirement) {
        setExtraRequirement((current) => current || restored.extraRequirement || "");
      }
      setRouteContext((current) =>
        mergeRouteContext(current, {
          ...restored.routeContext,
          draftId: loadedDraftBundle.draft.id,
          variantId: routeVariant ?? fallbackVariantId,
        }),
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "脚本草稿加载失败");
    }
  }

  const loadDraftBundleFromEffect = useEffectEvent(async (nextDraftId: string) => {
    await loadDraftBundle(nextDraftId);
  });

  async function sendWorkbenchAgentMessage(
    userMessage: string,
    options?: {
      intent?: "chat" | "generate" | "revise";
      goal?: string;
      extraRequirement?: string;
      conversationMessages?: VideoWorkbenchChatMessage[];
    },
  ) {
    const nextGoal = options?.goal ?? goal;
    const nextExtraRequirement = options?.extraRequirement ?? extraRequirement;
    const requestIntent = options?.intent ?? "chat";
    const requestDraftId = draftBundle?.draft.id ?? routeContext.draftId ?? null;
    const selectedVariantBelongsToDraft =
      Boolean(selectedVariant && requestDraftId && selectedVariant.draftId === requestDraftId);
    const routeVariantBelongsToDraft =
      Boolean(
        routeContext.variantId &&
        requestDraftId &&
        draftBundle?.variants.some(
          (variant) => variant.id === routeContext.variantId && variant.draftId === requestDraftId,
        ),
      );
    const requestVariantId = selectedVariantBelongsToDraft
      ? selectedVariant?.id ?? null
      : routeVariantBelongsToDraft
        ? routeContext.variantId
        : null;

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/content/video-workbench-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: routeContext.sessionId,
          dailyTaskId: routeContext.dailyTaskId,
          source: routeContext.source,
          calendarItemId: routeContext.calendarItemId,
          goal: nextGoal,
          userMessage,
          messages: (options?.conversationMessages ?? messages).map((message) => ({
            role: message.role === "agent" ? "assistant" : message.role,
            content: message.content,
          })),
          intent: requestIntent,
          contentVariantId: requestVariantId,
          draftId: requestDraftId,
          materialId: referenceMaterial?.id ?? routeContext.materialId ?? null,
          materialReferenceId: routeContext.materialReferenceId ?? null,
          strategyTag: routeContext.strategyTag,
        }),
      });
      const data = (await response.json()) as VideoWorkbenchAgentResponse;

      if (!response.ok || data.error) {
        throw new Error(formatApiError(data.error, "脚本助手响应失败"));
      }

      if (data.draftBundle) {
        const nextDraftBundle = data.draftBundle;

        setDraftBundle(nextDraftBundle);
        setSelectedVariantId(
          nextDraftBundle.selectedVariant?.id ?? nextDraftBundle.variants[0]?.id ?? null,
        );
        setRouteContext((current) => ({
          ...current,
          draftId: nextDraftBundle.draft.id,
          variantId:
            nextDraftBundle.selectedVariant?.id ??
            nextDraftBundle.draft.selectedVariantId ??
            nextDraftBundle.variants[0]?.id ??
            null,
        }));
        setSegmentUploads({});
        setShowCanvas(true);
      }

      setExtraRequirement(nextExtraRequirement);
      setMessages((current) =>
        appendAgentMessage(
          current,
          data.assistantMessage ??
            (data.toolApplied
              ? "已更新右侧脚本画布。"
              : "我先记下这个方向。你确认要生成或修改脚本时，我会更新右侧脚本画布。"),
        ),
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "脚本助手响应失败");
    } finally {
      setGenerating(false);
    }
  }

  async function generateScript(overrides?: {
    goal?: string;
    extraRequirement?: string;
  }) {
    const nextGoal = overrides?.goal ?? goal;
    const nextExtraRequirement = overrides?.extraRequirement ?? extraRequirement;
    const userMessage = selectedVariant
      ? [
          "请基于右侧当前脚本覆盖修改一版。",
          nextExtraRequirement ? `补充要求：${nextExtraRequirement}` : null,
        ].filter(Boolean).join("\n")
      : [
          "请根据当前上下文生成一版视频脚本。",
          nextGoal ? `目标方向：${nextGoal}` : null,
          nextExtraRequirement ? `补充要求：${nextExtraRequirement}` : null,
        ].filter(Boolean).join("\n");

    await sendWorkbenchAgentMessage(userMessage, {
      intent: selectedVariant ? "revise" : "generate",
      goal: nextGoal,
      extraRequirement: nextExtraRequirement,
    });
  }

  async function approveSelectedScript() {
    if (!selectedVariant) {
      setError("请先选择一个脚本候选。");
      return;
    }

    setApprovingScript(true);
    setError(null);

    try {
      const response = await fetch(`/api/content/variants/${selectedVariant.id}/approve`, {
        method: "POST",
      });
      const data = (await response.json()) as {
        variant?: NonNullable<ContentDraftBundleDto["selectedVariant"]>;
        error?: { message?: string };
      };

      if (!response.ok || !data.variant) {
        throw new Error(data.error?.message ?? "脚本确认失败");
      }

      const approvedVariant = mergeVariantWithProductionScenes(data.variant, selectedVariant);
      setDraftBundle((current) => {
        if (!current) {
          return current;
        }

        const variants = current.variants.map((variant) =>
          variant.id === approvedVariant.id ? approvedVariant : variant,
        );

        return {
          ...current,
          draft: {
            ...current.draft,
            selectedVariantId: approvedVariant.id,
          },
          variants,
          selectedVariant: approvedVariant,
        };
      });
      setSelectedVariantId(approvedVariant.id);
      setRouteContext((current) => ({
        ...current,
        variantId: approvedVariant.id,
      }));
      setMessages((current) =>
        appendAgentMessage(
          current,
          `已确认脚本「${approvedVariant.title ?? "当前候选"}」。现在可以创建正式 AI 剪辑任务。`,
        ),
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "脚本确认失败");
    } finally {
      setApprovingScript(false);
    }
  }

  async function createVideoJob(sourceJobId?: string, instructionOverride?: string) {
    if (!sourceJobId && job && isVideoEditJobInFlightStatus(job.status)) {
      setError("当前 AI 剪辑任务正在进行中，请等待完成后再创建新的任务。");
      return;
    }
    if (!selectedVariant) {
      setError("请先生成视频脚本。");
      return;
    }

    setCreatingJob(true);
    setError(null);

    try {
      const productionConfig = buildProductionConfig({
        mode: voiceoverMode,
        systemVoiceProvider,
        systemVoiceSpeaker,
        includeOriginalAudio,
        voiceProfiles,
        selectedVoiceProfileId,
      });
      const response = await fetch("/api/video-edit-jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentVariantId: selectedVariant.id,
          instructionText: instructionOverride || extraRequirement || goal || selectedVariant.title,
          sourceJobId: sourceJobId ?? null,
          productionConfig,
        }),
      });
      const data = (await response.json()) as {
        job?: PublicVideoEditJobDto;
        error?: { message?: string };
      };

      if (!response.ok || !data.job) {
        throw new Error(data.error?.message ?? "视频任务创建失败");
      }

      const createdJob = data.job;

      setJob(createdJob);
      setRouteContext((current) => ({
        ...current,
        draftId: createdJob.draftId,
        variantId: selectedVariant.id,
        jobId: createdJob.id,
      }));
      setMessages((current) =>
        appendAgentMessage(
          current,
          sourceJobId
            ? "制作修订任务已经创建。我会保留原任务，并在右侧显示新任务进度。"
            : "AI 剪辑任务已经创建。我会在右侧持续显示任务进度，完成后这里会出现可预览的成片结果。",
        ),
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "视频任务创建失败");
    } finally {
      setCreatingJob(false);
    }
  }

  async function uploadSegmentAsset(index: number, file: File) {
    if (!draftBundle) {
      setError("请先生成视频脚本，再上传镜头素材。");
      return;
    }

    if (!isSupportedSegmentMediaFile(file)) {
      setError("镜头素材只支持图片或视频文件。");
      return;
    }

    setError(null);
    setSegmentUploads((current) => ({
      ...current,
      [index]: {
        status: "uploading",
        progressPct: 0,
        stage: "preparing",
        fileName: file.name,
      },
    }));

    let uploadSettled = false;

    try {
      const asset = await uploadDraftMediaFile({
        draftId: draftBundle.draft.id,
        file,
        sortOrder: index,
        onStageChange(stage) {
          setSegmentUploads((current) => ({
            ...current,
            [index]: updateUploadInProgressState(current[index], file.name, {
              stage,
              progressPct: stage === "finalizing" ? 100 : current[index]?.progressPct ?? 0,
            }),
          }));
        },
        onProgress(progress) {
          if (uploadSettled) {
            return;
          }

          setSegmentUploads((current) => ({
            ...current,
            [index]: updateUploadInProgressState(current[index], file.name, {
              stage: "uploading",
              progressPct: normalizeUploadPercent(progress.percent),
            }),
          }));
        },
      });

      uploadSettled = true;
      setSegmentUploads((current) => ({
        ...current,
        [index]: {
          status: "uploaded",
          progressPct: 100,
          stage: "finalizing",
          fileName: file.name,
          asset,
        },
      }));
      setMessages((current) =>
        appendAgentMessage(
          current,
          `镜头 ${index + 1} 的素材已上传并绑定到当前视频草稿，创建剪辑任务时会交给 worker 使用。`,
        ),
      );
    } catch (uploadError) {
      uploadSettled = true;
      const message = uploadError instanceof Error ? uploadError.message : "镜头素材上传失败";
      setSegmentUploads((current) => ({
        ...current,
        [index]: {
          status: "failed",
          progressPct: 0,
          stage: current[index]?.stage,
          fileName: file.name,
          error: message,
        },
      }));
      setError(message);
    }
  }

  async function loadVoiceProfiles() {
    setLoadingVoiceProfiles(true);

    try {
      const response = await fetch("/api/voice-profiles", {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        voiceProfiles?: VoiceProfileDto[];
        error?: { message?: string };
      };

      if (!response.ok) {
        throw new Error(data.error?.message ?? "克隆音色加载失败");
      }

      const profiles = data.voiceProfiles ?? [];
      setVoiceProfiles(profiles);
      setSelectedVoiceProfileId((current) =>
        current && profiles.some((profile) => profile.id === current)
          ? current
          : profiles[0]?.id ?? "",
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "克隆音色加载失败");
    } finally {
      setLoadingVoiceProfiles(false);
    }
  }

  async function createVoiceProfileFromFile(file: File) {
    if (!isSupportedVoiceProfileAudioFile(file)) {
      setError("克隆音色参考音频仅支持 wav、mp3、m4a、aac、ogg、opus、webm 音频文件。");
      return;
    }

    if (!voiceProfileCreate.authorizationAccepted) {
      setError("请先确认已获得声音克隆授权。");
      return;
    }

    const displayName = voiceProfileCreate.displayName.trim() || file.name.replace(/\.[^.]+$/, "");

    setError(null);
    setVoiceProfileCreate((current) => ({
      ...current,
      displayName,
      fileName: file.name,
      status: "uploading",
      stage: "preparing",
      progressPct: 0,
      error: undefined,
    }));

    try {
      const data = await uploadVoiceProfileAudioFile({
        displayName,
        authorizationAccepted: true,
        file,
        onStageChange(stage) {
          setVoiceProfileCreate((current) => ({
            ...current,
            status: "uploading",
            stage,
            progressPct: stage === "finalizing" ? 100 : current.progressPct,
          }));
        },
        onProgress(progress) {
          setVoiceProfileCreate((current) => ({
            ...current,
            status: "uploading",
            stage: "uploading",
            progressPct: normalizeUploadPercent(progress.percent),
          }));
        },
      });

      setVoiceProfiles((current) => [
        data.voiceProfile,
        ...current.filter((item) => item.id !== data.voiceProfile.id),
      ]);
      setSelectedVoiceProfileId(data.voiceProfile.id);
      setVoiceoverMode("voice_profile");
      setVoiceProfileCreate({
        displayName: "",
        authorizationAccepted: false,
        fileName: file.name,
        status: "ready",
        progressPct: 100,
        profile: data.voiceProfile,
      });
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "克隆音色创建失败";
      setVoiceProfileCreate((current) => ({
        ...current,
        status: "failed",
        error: message,
      }));
      setError(message);
    }
  }

  function setVoiceProfileCreateRecording(active: boolean) {
    setVoiceProfileCreate((current) => ({
      ...current,
      status: active ? "recording" : "idle",
      progressPct: 0,
      stage: undefined,
      error: undefined,
    }));
  }

  function setVoiceProfileCreateError(message: string) {
    setVoiceProfileCreate((current) => ({
      ...current,
      status: "failed",
      error: message,
    }));
    setError(message);
  }

  async function retryVideoJob(jobId: string) {
    setCreatingJob(true);
    setError(null);

    try {
      const response = await fetch(`/api/video-edit-jobs/${jobId}/retry`, {
        method: "POST",
      });
      const data = (await response.json()) as {
        job?: PublicVideoEditJobDto;
        error?: { message?: string };
      };

      if (!response.ok || !data.job) {
        throw new Error(data.error?.message ?? "视频任务重试失败");
      }

      const retriedJob = data.job;

      setJob(retriedJob);
      setRouteContext((current) => ({
        ...current,
        jobId: retriedJob.id,
      }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "视频任务重试失败");
    } finally {
      setCreatingJob(false);
    }
  }

  async function loadVideoJob(jobId: string) {
    try {
      const response = await fetch(`/api/video-edit-jobs/${jobId}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        job?: PublicVideoEditJobDto;
      };

      if (response.ok && data.job) {
        const loadedJob = data.job;

        setJob(loadedJob);
        setRouteContext((current) => ({
          ...current,
          draftId: loadedJob.draftId ?? current.draftId,
          variantId: loadedJob.contentVariantId ?? current.variantId,
          jobId: loadedJob.id ?? current.jobId,
        }));
      }
    } catch {
      // Ignore polling errors and keep the last visible state.
    }
  }

  function submitChatMessage() {
    const nextInput = input.trim();

    if (!nextInput) {
      return;
    }

    const previousMessages = messages;
    const nextExtraRequirement = [extraRequirement, nextInput].filter(Boolean).join("\n");
    setMessages((current) => [...current, { role: "user", content: nextInput }]);
    setExtraRequirement(nextExtraRequirement);
    setInput("");

    void sendWorkbenchAgentMessage(nextInput, {
      intent: "chat",
      extraRequirement: nextExtraRequirement,
      conversationMessages: previousMessages,
    });
  }

  function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitChatMessage();
  }

  useEffect(() => {
    const snapshot = readVideoWorkbenchSnapshot();
    if (!snapshot) {
      return;
    }

    const hasExplicitRouteContext = Boolean(
      sessionId ||
        dailyTaskId ||
        source ||
        calendarItemId ||
        draftId ||
        variantId ||
        jobId ||
        materialId ||
        materialReferenceId ||
        strategyTag,
    );
    const snapshotMatchesCurrent =
      (draftId && snapshot.routeContext.draftId === draftId) ||
      (jobId && snapshot.routeContext.jobId === jobId);

    if (hasExplicitRouteContext && !snapshotMatchesCurrent) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRouteContext((current) => mergeRouteContext(current, snapshot.routeContext));
    setGoal((current) => current || snapshot.goal || "");
    setExtraRequirement((current) => current || snapshot.extraRequirement || "");
    setSelectedVariantId((current) => current ?? snapshot.selectedVariantId ?? null);
    setShowCanvas(snapshot.showCanvas);
    setCanvasExpanded(snapshot.canvasExpanded);
    setMessages((current) =>
      isInitialOnlyMessages(current) && snapshot.messages.length > 0 ? snapshot.messages : current,
    );
  }, [
    calendarItemId,
    dailyTaskId,
    draftId,
    jobId,
    materialId,
    materialReferenceId,
    sessionId,
    source,
    strategyTag,
    variantId,
  ]);

  useEffect(() => {
    if (!routeContext.sessionId) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSession(routeContext.sessionId);
  }, [routeContext.sessionId]);

  useEffect(() => {
    if (!routeContext.materialId) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadReferenceMaterial(routeContext.materialId);
  }, [routeContext.materialId]);

  useEffect(() => {
    if (!routeContext.draftId) {
      return;
    }

    if (draftBundle?.draft.id === routeContext.draftId) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDraftBundleFromEffect(routeContext.draftId);
  }, [draftBundle?.draft.id, routeContext.draftId]);

  useEffect(() => {
    if (!routeContext.jobId) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadVideoJob(routeContext.jobId);
  }, [routeContext.jobId]);

  useEffect(() => {
    if (!routeContext.strategyTag) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages((current) =>
      isInitialOnlyMessages(current) ? buildInitialMessages(routeContext.strategyTag) : current,
    );
  }, [routeContext.strategyTag]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadVoiceProfiles();
  }, []);

  useEffect(() => {
    if (!selectedVariantId) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRouteContext((current) =>
      current.variantId === selectedVariantId
        ? current
        : {
            ...current,
            variantId: selectedVariantId,
          },
    );
  }, [selectedVariantId]);

  useEffect(() => {
    if (!job || !["pending", "queued", "preparing", "running"].includes(job.status)) {
      return;
    }

    const timer = window.setInterval(() => {
      void loadVideoJob(job.id);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [job]);

  useEffect(() => {
    const hasRecoverableState =
      routeContext.sessionId ||
      routeContext.dailyTaskId ||
      routeContext.draftId ||
      routeContext.jobId ||
      messages.length > 1;

    if (!hasRecoverableState) {
      clearVideoWorkbenchSnapshot();
      return;
    }

    writeVideoWorkbenchSnapshot({
      version: 1,
      routeContext,
      goal,
      extraRequirement,
      selectedVariantId,
      messages,
      showCanvas,
      canvasExpanded,
      savedAt: new Date().toISOString(),
    });
  }, [
    canvasExpanded,
    extraRequirement,
    goal,
    messages,
    routeContext,
    selectedVariantId,
    showCanvas,
  ]);

  const selectedVariant =
    draftBundle?.variants.find((variant) => variant.id === selectedVariantId) ??
    draftBundle?.selectedVariant ??
    draftBundle?.variants[0] ??
    null;
  const canvasScenes = useMemo(() => {
    const structuredScenes = selectedVariant?.productionScenes ?? [];

    if (structuredScenes.length > 0) {
      return structuredScenes;
    }

    const parsedScenes = parseScriptTextToScenes(selectedVariant?.scriptText ?? "");

    return parsedScenes;
  }, [selectedVariant]);
  const jobIsRunning = job && isVideoEditJobInFlightStatus(job.status);
  const scriptApproved = selectedVariant?.reviewStatus === "approved";
  const jobCanRetry = job?.status === "failed_retryable";
  const jobSucceeded = job?.status === "succeeded";
  const resultVideoAsset =
    job?.resultAssets?.find((asset) => asset.assetType === "video") ?? job?.resultAssets?.[0] ?? null;
  const resultVideoPreviewUrl = resultVideoAsset?.signedPreviewUrl ?? resultVideoAsset?.originUrl ?? null;
  const resultVideoDownloadUrl =
    resultVideoAsset?.signedDownloadUrl ?? resultVideoPreviewUrl;
  const progressModules = job?.progressModules ?? [];
  const jobStatusCopy = job
    ? buildVideoJobStatusCopy({
        status: job.status,
        currentStage: job.currentStage,
        progressPct: job.progressPct,
        failureReason: job.failureReason,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        hasResultPreview: Boolean(resultVideoPreviewUrl),
      })
    : null;
  const jobToneClassNames = getVideoJobToneClassNames(jobStatusCopy?.tone ?? "info");

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="flex min-h-14 shrink-0 flex-col gap-3 border-b border-[#eadfd7] px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:h-14 lg:py-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="rounded-lg p-2 text-[#8b7b72] hover:bg-[#fffaf7] hover:text-[#1f2328]">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl tracking-tight [font-family:var(--font-cormorant)]">
              视频脚本室
            </h1>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#9b8d84]">
              AI 对话 + 脚本画布
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[#0f766e] md:inline-flex">
            <CheckCircle2 className="h-3.5 w-3.5" />
            上下文已就绪
          </span>
          <button
            type="button"
            onClick={() => {
              void generateScript();
            }}
            disabled={generating || loadingSession}
            className="inline-flex items-center gap-2 rounded-full border border-[#f2556b]/25 bg-[#fff0ef] px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-[#f2556b] disabled:opacity-60"
          >
            {generating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Video className="h-3.5 w-3.5" />}
            {draftBundle ? "重新生成脚本" : "生成视频脚本"}
          </button>
          <button
            type="button"
            onClick={() => {
              void approveSelectedScript();
            }}
            disabled={approvingScript || !selectedVariant || scriptApproved}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-[#0f766e] disabled:opacity-50"
          >
            {approvingScript ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            {scriptApproved ? "脚本已锁定" : "创建时自动锁定"}
          </button>
          <button
            type="button"
            onClick={() => {
              void createVideoJob();
            }}
            disabled={creatingJob || Boolean(jobIsRunning) || !selectedVariant}
            className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[#eadfd7] bg-[#fffaf7] px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-[#5f514a] transition-colors hover:bg-[#fff0ef] disabled:opacity-50"
          >
            {creatingJob || jobIsRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#f2556b]" />
            ) : (
              <Wand2 className="h-3.5 w-3.5 text-[#f2556b]" />
            )}
            {jobIsRunning ? "AI 剪辑中" : "AI 一键剪辑"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="whitespace-pre-line border-b border-rose-500/20 bg-rose-500/10 px-6 py-3 text-sm leading-6 text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section
          className={
            showCanvas && canvasExpanded
              ? "hidden min-h-0 shrink-0 flex-col border-r border-[#eadfd7] bg-[#fffaf6] lg:flex lg:w-[320px]"
              : showCanvas
                ? "flex min-h-0 w-full shrink-0 flex-col border-b border-[#eadfd7] bg-[#fffaf6] lg:w-[420px] lg:border-b-0 lg:border-r"
                : "mx-auto flex min-h-0 w-full max-w-3xl flex-col bg-[#fffaf6]"
          }
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={message.role === "user" ? "flex flex-row-reverse gap-3" : "flex gap-3"}
              >
                <div
                  className={
                    message.role === "agent"
                      ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff0ef] text-[#f2556b]"
                      : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff0ef] text-xs text-[#6f625d]"
                  }
                >
                  {message.role === "agent" ? <PlayCircle className="h-4 w-4" /> : "商"}
                </div>
                <div
                  className={
                    message.role === "agent"
                      ? "rounded-2xl rounded-tl-none border border-[#eadfd7] bg-white p-4 text-sm leading-7 text-[#4f433d]"
                      : "rounded-2xl rounded-tr-none bg-[#f2556b] p-4 text-sm leading-7 text-[#fffaf7]"
                  }
                >
                  {message.content}
                </div>
              </div>
            ))}

            {generating ? (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff0ef] text-[#f2556b]">
                  <PlayCircle className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-none border border-[#eadfd7] bg-white p-4 text-sm italic text-[#8b7b72]">
                  <RefreshCw className="h-4 w-4 animate-spin text-[#f2556b]" />
                  正在和脚本助手沟通...
                </div>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-[#eadfd7] bg-[#fffaf7] p-5">
            <form onSubmit={handleSend} className="relative">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submitChatMessage();
                  }
                }}
                placeholder="告诉 AI：镜头节奏、台词风格、素材限制或转化目标..."
                className="max-h-32 min-h-20 w-full resize-none rounded-2xl border border-[#eadfd7] bg-[#fffaf7] px-4 py-3 pr-14 text-sm text-[#1f2328] outline-none placeholder:text-[#b2a49c] focus:border-[#f2556b]/50"
              />
              <button
                type="submit"
                disabled={generating || !input.trim()}
                className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f2556b] text-[#fffaf7] transition-colors hover:bg-[#e94b73] disabled:opacity-50"
                aria-label="发送脚本意见"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>

        {showCanvas ? (
          <section className="flex min-h-0 flex-1 justify-center overflow-hidden p-4 lg:p-7">
            <div className="flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-[#eadfd7] bg-white shadow-[0_24px_100px_rgba(77,53,43,0.10)]">
              <div className="flex shrink-0 flex-col gap-3 border-b border-[#eadfd7] bg-[#fffaf7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="max-w-xl truncate text-base text-[#1f2328] [font-family:var(--font-cormorant)]">
                      {selectedVariant?.title ??
                        session?.strategySnapshot.videoBrief?.workingTitle ??
                        referenceMaterial?.title ??
                        "等待生成视频脚本"}
                    </h2>
                    {routeContext.strategyTag ? (
                      <span className="rounded-full border border-[#f2556b]/25 bg-[#fff0ef] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[#f2556b]">
                        {routeContext.strategyTag}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#9b8d84]">
                    镜头画布 · 台词 · 素材要求
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCanvasExpanded((current) => !current)}
                    className="rounded-xl border border-[#eadfd7] bg-[#fffaf7] p-2 text-[#8b7b72] transition-colors hover:text-[#f2556b]"
                    aria-label={canvasExpanded ? "缩小画布" : "放大画布"}
                  >
                    {canvasExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCanvas(false)}
                    className="rounded-xl border border-[#eadfd7] bg-[#fffaf7] p-2 text-[#8b7b72] transition-colors hover:text-[#1f2328]"
                    aria-label="收起画布"
                  >
                    <PanelRightClose className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-6">
                {selectedVariant ? (
                  <div className="space-y-5">
                    <VoiceoverSettingsPanel
                      mode={voiceoverMode}
                      onModeChange={setVoiceoverMode}
                      systemVoiceProvider={systemVoiceProvider}
                      onSystemVoiceProviderChange={setSystemVoiceProvider}
                      systemVoiceSpeaker={systemVoiceSpeaker}
                      onSystemVoiceSpeakerChange={setSystemVoiceSpeaker}
                      includeOriginalAudio={includeOriginalAudio}
                      onIncludeOriginalAudioChange={setIncludeOriginalAudio}
                      voiceProfiles={voiceProfiles}
                      selectedVoiceProfileId={selectedVoiceProfileId}
                      onSelectedVoiceProfileIdChange={setSelectedVoiceProfileId}
                      loadingVoiceProfiles={loadingVoiceProfiles}
                      createState={voiceProfileCreate}
                      onCreateStateChange={setVoiceProfileCreate}
                      onCreateFromFile={(file) => void createVoiceProfileFromFile(file)}
                      onRecordingStateChange={setVoiceProfileCreateRecording}
                      onRecordingError={setVoiceProfileCreateError}
                    />

                    <div className="overflow-hidden rounded-2xl border border-[#eadfd7] bg-[#fffaf7]">
                    <div className="grid grid-cols-12 border-b border-[#eadfd7] bg-[#fffaf7] text-[10px] uppercase tracking-[0.2em] text-[#9b8d84]">
                      <div className="col-span-2 border-r border-[#eadfd7] p-4 text-center">时长</div>
                      <div className="col-span-4 border-r border-[#eadfd7] p-4">画面 / 镜头要求</div>
                      <div className="col-span-4 border-r border-[#eadfd7] p-4">台词 / 旁白</div>
                      <div className="col-span-2 p-4 text-center">素材</div>
                    </div>
                    {canvasScenes.map((scene, index) => (
                      <ScriptSegmentRow
                        key={`${scene.sceneNo}-${scene.timeRange}-${index}`}
                        index={index}
                        scene={scene}
                        uploadState={segmentUploads[index]}
                        onUpload={(file) => void uploadSegmentAsset(index, file)}
                      />
                    ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-[420px] items-center justify-center">
                    <div className="max-w-lg text-center">
                      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#eadfd7] bg-[#fffaf7] text-[#f2556b]">
                        <Film className="h-8 w-8" />
                      </div>
                      <p className="text-3xl text-[#1f2328] [font-family:var(--font-cormorant)]">
                        视频脚本还没生成
                      </p>
                      <p className="mt-4 text-sm leading-7 text-[#8b7b72]">
                        左侧继续和 AI 对话，或点击顶部「生成视频脚本」。脚本生成后，这里会变成可放大/收起的镜头画布。
                      </p>
                    </div>
                  </div>
                )}

                <div className={`mt-6 rounded-2xl border p-5 ${jobToneClassNames.panel}`}>
                  <div className="flex items-start gap-4">
                    <div className={`rounded-xl p-2 ${jobToneClassNames.icon}`}>
                      {jobIsRunning ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Sparkles className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-[#1f2328] [font-family:var(--font-cormorant)]">
                        {jobStatusCopy?.title ?? "AI 一键剪辑提示"}
                      </p>
                      <p className="mt-2 text-xs leading-6 text-[#7f7067]">
                        {jobStatusCopy?.detail ??
                          "脚本确认后点击顶部「AI 一键剪辑」，系统会按镜头顺序和素材要求创建视频任务。"}
                      </p>
                      {jobStatusCopy?.nextAction ? (
                        <p className={`mt-3 rounded-2xl px-3 py-2 text-xs leading-6 ${jobToneClassNames.message}`}>
                          {jobStatusCopy.nextAction}
                        </p>
                      ) : null}
                      {jobStatusCopy?.badge ? (
                        <div className={`mt-4 inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] ${jobToneClassNames.badge}`}>
                          <Clock className="mr-2 h-3.5 w-3.5" />
                          {jobStatusCopy.badge}
                        </div>
                      ) : null}
                      {progressModules.length > 0 ? (
                        <VideoProgressModules modules={progressModules} />
                      ) : null}
                      {jobCanRetry ? (
                        <button
                          type="button"
                          onClick={() => void retryVideoJob(job.id)}
                          disabled={creatingJob}
                          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#f2556b]/25 bg-[#fff0ef] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-[#f2556b] disabled:opacity-50"
                        >
                          {creatingJob ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                          重试任务
                        </button>
                      ) : null}
                      {jobSucceeded && selectedVariant ? (
                        <button
                          type="button"
                          onClick={() => void createVideoJob(job.id)}
                          disabled={creatingJob}
                          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#eadfd7] bg-[#fffaf7] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-[#6f625d] transition-colors hover:bg-[#fff0ef] hover:text-[#1f2328] disabled:opacity-50"
                        >
                          {creatingJob ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                          制作修订
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {resultVideoPreviewUrl ? (
                    <div className="mt-5">
                      <video
                        controls
                        playsInline
                        preload="metadata"
                        className="aspect-video w-full rounded-2xl border border-[#eadfd7] bg-[#f3ede7]"
                        src={resultVideoPreviewUrl}
                      />
                      {resultVideoDownloadUrl ? (
                        <a
                          href={resultVideoDownloadUrl}
                          className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#eadfd7] bg-[#fffaf7] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-[#6f625d] transition-colors hover:bg-[#fff0ef] hover:text-[#1f2328]"
                        >
                          <Download className="h-3.5 w-3.5" />
                          下载成片
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="flex min-h-0 flex-1 items-center justify-center p-8">
            <button
              type="button"
              onClick={() => setShowCanvas(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[#eadfd7] bg-[#fffaf7] px-5 py-3 text-[10px] uppercase tracking-[0.25em] text-[#6f625d] transition-colors hover:bg-[#fff0ef] hover:text-[#1f2328]"
            >
              <PanelRightOpen className="h-4 w-4" />
              展开脚本画布
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

function VideoProgressModules({ modules }: { modules: VideoEditProgressModuleDto[] }) {
  return (
    <div className="mt-5 grid gap-2">
      {modules.map((module) => (
        <div key={module.key} className="flex items-center gap-3 rounded-2xl border border-[#eadfd7] bg-[#fffaf7] px-3 py-2">
          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${getProgressModuleIconClass(module.status)}`}>
            {module.status === "running" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : module.status === "succeeded" ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-xs text-[#5f514a]">{module.label}</p>
              <span className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-[#9b8d84]">
                {getProgressModuleStatusLabel(module.status)}
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#fff0ef]">
              <div
                className={`h-full rounded-full ${getProgressModuleBarClass(module.status)}`}
                style={{ width: `${module.progressPct}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function VoiceoverSettingsPanel({
  mode,
  onModeChange,
  systemVoiceProvider,
  onSystemVoiceProviderChange,
  systemVoiceSpeaker,
  onSystemVoiceSpeakerChange,
  includeOriginalAudio,
  onIncludeOriginalAudioChange,
  voiceProfiles,
  selectedVoiceProfileId,
  onSelectedVoiceProfileIdChange,
  loadingVoiceProfiles,
  createState,
  onCreateStateChange,
  onCreateFromFile,
  onRecordingStateChange,
  onRecordingError,
}: {
  mode: VoiceoverMode;
  onModeChange: (mode: VoiceoverMode) => void;
  systemVoiceProvider: string;
  onSystemVoiceProviderChange: (provider: string) => void;
  systemVoiceSpeaker: string;
  onSystemVoiceSpeakerChange: (speaker: string) => void;
  includeOriginalAudio: boolean;
  onIncludeOriginalAudioChange: (value: boolean) => void;
  voiceProfiles: VoiceProfileDto[];
  selectedVoiceProfileId: string;
  onSelectedVoiceProfileIdChange: (id: string) => void;
  loadingVoiceProfiles: boolean;
  createState: VoiceProfileCreateState;
  onCreateStateChange: (updater: (current: VoiceProfileCreateState) => VoiceProfileCreateState) => void;
  onCreateFromFile: (file: File) => void;
  onRecordingStateChange: (active: boolean) => void;
  onRecordingError: (message: string) => void;
}) {
  const isRecording = createState.status === "recording";
  const isCreating = createState.status === "uploading" || createState.status === "creating";
  const isBusy = isRecording || isCreating;
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);

  useEffect(
    () => () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        recorder.onerror = null;
        recorder.stop();
      }
      stopRecordingStream(recordingStreamRef.current);
    },
    [],
  );

  async function startRecording() {
    if (!createState.authorizationAccepted) {
      onRecordingError("请先确认已获得声音克隆授权。");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      onRecordingError("当前浏览器不支持录音，请改用上传参考音频。");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedRecordingMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      recordingChunksRef.current = [];
      recordingStreamRef.current = stream;
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const chunks = recordingChunksRef.current;
        const recordedMimeType = recorder.mimeType || mimeType || "audio/webm";
        stopRecordingStream(stream);
        recordingStreamRef.current = null;
        mediaRecorderRef.current = null;
        onRecordingStateChange(false);

        if (chunks.length === 0) {
          onRecordingError("没有录到有效声音，请重新录制或上传音频。");
          return;
        }

        const extension = recordedMimeType.includes("ogg") ? "ogg" : "webm";
        const blob = new Blob(chunks, { type: recordedMimeType });
        const file = new File([blob], `voice-profile-recording-${Date.now()}.${extension}`, {
          type: recordedMimeType,
        });
        onCreateFromFile(file);
      };
      recorder.onerror = () => {
        stopRecordingStream(stream);
        recordingStreamRef.current = null;
        mediaRecorderRef.current = null;
        onRecordingError("录音失败，请重试或上传参考音频。");
      };

      recorder.start();
      onRecordingStateChange(true);
    } catch {
      onRecordingError("无法访问麦克风，请检查浏览器授权或改用上传音频。");
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return;
    }
    recorder.stop();
  }

  return (
    <div className="rounded-2xl border border-[#eadfd7] bg-[#fffaf7] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-[#f2556b]/25 bg-[#fff0ef] p-2 text-[#f2556b]">
            <Volume2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm text-[#3d332f]">配音</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#9b8d84]">
              voiceover
            </p>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-xs text-[#7f7067]">
          <input
            type="checkbox"
            checked={includeOriginalAudio}
            onChange={(event) => onIncludeOriginalAudioChange(event.target.checked)}
            className="h-4 w-4 accent-[#f2556b]"
          />
          保留原视频声音
        </label>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onModeChange("system")}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
            mode === "system"
              ? "border-[#f2556b]/35 bg-[#fff0ef] text-[#8a4b00]"
              : "border-[#eadfd7] bg-[#fffaf7] text-[#6f625d] hover:bg-[#fff5f1]"
          }`}
        >
          <Radio className="h-4 w-4" />
          <span className="text-sm">系统配音</span>
        </button>
        <button
          type="button"
          onClick={() => onModeChange("voice_profile")}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
            mode === "voice_profile"
              ? "border-emerald-500/35 bg-emerald-500/10 text-[#0f766e]"
              : "border-[#eadfd7] bg-[#fffaf7] text-[#6f625d] hover:bg-[#fff5f1]"
          }`}
        >
          <Volume2 className="h-4 w-4" />
          <span className="text-sm">我的克隆音色</span>
        </button>
      </div>

      {mode === "system" ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 text-xs text-[#8b7b72]">
            Provider
            <select
              value={systemVoiceProvider}
              onChange={(event) => onSystemVoiceProviderChange(event.target.value)}
              className="h-10 rounded-xl border border-[#eadfd7] bg-[#fffaf7] px-3 text-sm text-[#4f433d] outline-none focus:border-[#f2556b]/45"
            >
              <option value="aliyun_cosyvoice">Aliyun CosyVoice</option>
              <option value="bytedance_bigtts">ByteDance BigTTS</option>
              <option value="minimax">Minimax</option>
              <option value="302">302</option>
            </select>
          </label>
          <label className="grid gap-2 text-xs text-[#8b7b72]">
            Speaker
            <input
              value={systemVoiceSpeaker}
              onChange={(event) => onSystemVoiceSpeakerChange(event.target.value)}
              placeholder="可选"
              className="h-10 rounded-xl border border-[#eadfd7] bg-[#fffaf7] px-3 text-sm text-[#4f433d] outline-none placeholder:text-[#b2a49c] focus:border-[#f2556b]/45"
            />
          </label>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <label className="grid gap-2 text-xs text-[#8b7b72]">
            已有音色
            <select
              value={selectedVoiceProfileId}
              onChange={(event) => onSelectedVoiceProfileIdChange(event.target.value)}
              disabled={loadingVoiceProfiles || voiceProfiles.length === 0}
              className="h-10 rounded-xl border border-[#eadfd7] bg-[#fffaf7] px-3 text-sm text-[#4f433d] outline-none disabled:opacity-50"
            >
              {voiceProfiles.length === 0 ? (
                <option value="">暂无克隆音色</option>
              ) : (
                voiceProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.displayName}
                  </option>
                ))
              )}
            </select>
          </label>

          <div className="rounded-xl border border-[#eadfd7] bg-[#fffaf7] p-4">
            <div className="grid gap-3">
              <input
                value={createState.displayName}
                onChange={(event) =>
                  onCreateStateChange((current) => ({
                    ...current,
                    displayName: event.target.value,
                  }))
                }
                placeholder="新音色名称"
                className="h-10 rounded-xl border border-[#eadfd7] bg-[#fffaf7] px-3 text-sm text-[#4f433d] outline-none placeholder:text-[#b2a49c] focus:border-emerald-500/45"
              />
              <label className="flex items-start gap-2 text-xs leading-5 text-[#7f7067]">
                <input
                  type="checkbox"
                  checked={createState.authorizationAccepted}
                  onChange={(event) =>
                    onCreateStateChange((current) => ({
                      ...current,
                      authorizationAccepted: event.target.checked,
                    }))
                  }
                  className="mt-0.5 h-4 w-4 accent-emerald-500"
                />
                我确认已获得该声音用于克隆和视频配音的授权。
              </label>
              <label
                className={`flex h-20 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-3 text-center transition-colors ${
                  isBusy
                    ? "border-emerald-500/30 bg-emerald-500/10 text-[#0f766e]"
                    : "border-[#eadfd7] bg-[#fffaf7] text-[#9b8d84] hover:border-emerald-500/40 hover:text-[#0f766e]"
                }`}
              >
                <input
                  type="file"
                  accept="audio/*,.m4a,.mp3,.wav,.aac,.ogg,.opus,.webm"
                  className="hidden"
                  disabled={isBusy}
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    event.currentTarget.value = "";
                    if (file) {
                      onCreateFromFile(file);
                    }
                  }}
                />
                {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                <span className="max-w-full truncate text-[10px] uppercase tracking-[0.16em]">
                  {isCreating ? `${getVoiceProfileUploadStageLabel(createState)} ${createState.progressPct}%` : "上传参考音频"}
                </span>
              </label>
              <button
                type="button"
                onClick={isRecording ? stopRecording : () => void startRecording()}
                disabled={isCreating}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  isRecording
                    ? "border-rose-500/35 bg-rose-500/10 text-rose-700"
                    : "border-[#eadfd7] bg-[#fffaf7] text-[#7f7067] hover:border-emerald-500/40 hover:text-[#0f766e]"
                }`}
              >
                {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isRecording ? "停止并创建音色" : "录音创建音色"}
              </button>
              {createState.error ? (
                <p className="text-xs leading-5 text-rose-600">{createState.error}</p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScriptSegmentRow({
  index,
  scene,
  uploadState,
  onUpload,
}: {
  index: number;
  scene: VideoScriptSceneDto;
  uploadState?: SegmentUploadState;
  onUpload: (file: File) => void;
}) {
  const isUploading = uploadState?.status === "uploading";
  const isUploaded = uploadState?.status === "uploaded";
  const sceneNo = scene.sceneNo || index + 1;
  const materials = scene.materials.filter(Boolean);

  return (
    <div className="grid grid-cols-12 border-b border-[#eadfd7]/70 last:border-b-0 hover:bg-[#fffaf7]">
      <div className="col-span-2 flex flex-col items-center justify-start border-r border-[#eadfd7]/70 p-5 text-center font-mono text-xs text-[#7f7067]">
        {scene.timeRange}
        <span className="mt-3 rounded border border-[#f2556b]/25 bg-[#fff0ef] px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-[#f2556b]">
          镜头 {sceneNo}
        </span>
      </div>
      <div className="col-span-4 border-r border-[#eadfd7]/70 p-5 text-sm leading-7 text-[#4f433d] [font-family:var(--font-cormorant)]">
        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#c46a00]">
          镜头要求
        </p>
        <p className="text-[#2f2824]">{scene.shotRequirement}</p>
        <p className="mt-3 text-[#5f514a]">{scene.visual}</p>
        <dl className="mt-4 space-y-2 text-xs leading-5 text-[#8b7b72]">
          <div>
            <dt className="inline text-[#c46a00]">运镜：</dt>
            <dd className="inline">{scene.cameraMovement}</dd>
          </div>
          <div>
            <dt className="inline text-[#c46a00]">目的：</dt>
            <dd className="inline">{scene.purpose}</dd>
          </div>
          <div>
            <dt className="inline text-[#c46a00]">备选：</dt>
            <dd className="inline">{scene.fallbackShot}</dd>
          </div>
        </dl>
      </div>
      <div className="col-span-4 border-r border-[#eadfd7]/70 p-5 text-sm leading-7 text-[#3d332f] whitespace-pre-wrap [font-family:var(--font-cormorant)]">
        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#9b8d84]">
          台词 / 旁白
        </p>
        <p>{scene.voiceover}</p>
        {scene.subtitle ? (
          <p className="mt-4 rounded-xl border border-[#eadfd7] bg-[#fffaf7] p-3 text-xs leading-6 text-[#7f7067]">
            字幕：{scene.subtitle}
          </p>
        ) : null}
      </div>
      <div className="col-span-2 flex flex-col items-center justify-center gap-3 p-5">
        {materials.length > 0 ? (
          <div className="w-full space-y-1 text-center text-[10px] leading-5 text-[#8b7b72]">
            {materials.map((material) => (
              <div
                key={material}
                className="truncate rounded-full border border-[#eadfd7] bg-[#fffaf7] px-2 py-1"
                title={material}
              >
                {material}
              </div>
            ))}
          </div>
        ) : null}
        {isUploading ? (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-[#f2556b]/25 bg-[#fff0ef] px-2 text-[#c46a00]">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-[10px] uppercase tracking-[0.16em]">
              {getSegmentUploadStageLabel(uploadState)}
            </span>
          </div>
        ) : (
          <label
            className={
              isUploaded
                ? "flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2 text-center text-[#0f766e] transition-colors hover:border-emerald-400/50 hover:bg-emerald-500/15"
                : "flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#eadfd7] bg-[#fffaf7] px-2 text-center text-[#9b8d84] transition-colors hover:border-[#f2556b]/40 hover:bg-[#fff7ed] hover:text-[#f2556b]"
            }
          >
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (file) {
                  onUpload(file);
                }
              }}
            />
            {isUploaded ? <Film className="h-5 w-5" /> : <UploadCloud className="h-5 w-5" />}
            <span className="max-w-full truncate text-[10px] uppercase tracking-[0.16em]">
              {isUploaded ? uploadState.fileName ?? "已上传" : uploadState?.status === "failed" ? "重传" : "传镜头"}
            </span>
            {isUploaded && uploadState.asset ? (
              <span className="max-w-full truncate text-[9px] text-[#0f766e]/65">
                {formatAssetSize(uploadState.asset.fileSizeBytes)}
              </span>
            ) : null}
            {uploadState?.status === "failed" && uploadState.error ? (
              <span className="max-w-full truncate text-[9px] text-rose-600/75">
                上传失败
              </span>
            ) : null}
          </label>
        )}
      </div>
    </div>
  );
}

function buildInitialMessages(strategyTag?: string | null): VideoWorkbenchChatMessage[] {
  return [
    {
      role: "agent",
      content: `我已经准备好把咨询策略拆成镜头表、台词和素材要求。${
        strategyTag ? `这次内容策略是「${strategyTag}」。` : ""
      }你可以直接告诉我希望视频偏种草、转化，还是人设表达。`,
    },
  ];
}

function appendAgentMessage(
  current: VideoWorkbenchChatMessage[],
  content: string,
): VideoWorkbenchChatMessage[] {
  if (current.some((message) => message.role === "agent" && message.content === content)) {
    return current;
  }

  return [...current, { role: "agent", content }];
}

function isInitialOnlyMessages(messages: VideoWorkbenchChatMessage[]) {
  return messages.length <= 1 && messages.every((message) => message.role === "agent");
}

function parseScriptTextToScenes(scriptText: string): VideoScriptSceneDto[] {
  const text = scriptText.trim();

  if (!text) {
    return [];
  }

  const sceneText = stripScriptPreamble(text);
  const sceneBlocks = sceneText
    .split(/(?=^Scene\s+\d+\s*\|)|(?=^镜头\s*\d+[：:])/gim)
    .map((block) => block.trim())
    .filter(Boolean);

  if (sceneBlocks.length > 1 || /^Scene\s+\d+\s*\|/i.test(sceneBlocks[0] ?? "")) {
    return sceneBlocks.map((block, index) => parseSceneBlock(block, index));
  }

  const taggedBlocks = sceneText
    .split(/(?=【镜头\s*\d*】)|(?=镜头\s*\d+[：:])/g)
    .map((block) => block.trim())
    .filter(Boolean);

  if (taggedBlocks.length > 1) {
    return taggedBlocks.map((block, index) => parseSceneBlock(block, index));
  }

  return [];
}

function mergeVariantWithProductionScenes(
  approvedVariant: NonNullable<ContentDraftBundleDto["selectedVariant"]>,
  currentVariant: NonNullable<ContentDraftBundleDto["selectedVariant"]>,
) {
  const approvedScenes = approvedVariant.productionScenes ?? [];

  return {
    ...currentVariant,
    ...approvedVariant,
    productionScenes: approvedScenes.length > 0 ? approvedScenes : currentVariant.productionScenes ?? [],
  };
}

function stripScriptPreamble(text: string) {
  const firstSceneIndex = findFirstSceneMarkerIndex(text);

  if (firstSceneIndex < 0) {
    return text;
  }

  return text.slice(firstSceneIndex).trim();
}

function findFirstSceneMarkerIndex(text: string) {
  const markers = [
    /^Scene\s+\d+\s*\|/im,
    /^镜头\s*\d+[：:]/im,
    /^【镜头\s*\d*】/im,
  ];
  const indexes = markers
    .map((marker) => text.search(marker))
    .filter((index) => index >= 0);

  return indexes.length > 0 ? Math.min(...indexes) : -1;
}

function parseSceneBlock(block: string, index: number): VideoScriptSceneDto {
  const header = block.match(/(?:Scene\s+(\d+)\s*\|\s*([^\n]+))|(?:镜头\s*(\d+)[：:]\s*([^\n]+)?)/i);
  const sceneNo = Number(header?.[1] ?? header?.[3] ?? index + 1);
  const timeRange = normalizeSceneTime(header?.[2]) ?? fallbackTimeRange(index);
  const visual = readTaggedText(block, ["画面", "镜头", "视觉"]) ?? stripSceneHeader(block).split("\n")[0]?.trim() ?? "";
  const voiceover = readTaggedText(block, ["台词", "口播", "旁白"]) ?? "";
  const subtitle = readTaggedText(block, ["字幕"]) ?? voiceover;
  const shotRequirement =
    readTaggedText(block, ["镜头要求", "要求"]) ||
    (visual ? `拍清楚：${visual}` : "按本镜头台词安排可拍画面。");
  const materials = readTaggedText(block, ["素材", "所需素材"])
    ?.split(/[、,，/]/)
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

  return {
    sceneNo: Number.isFinite(sceneNo) ? sceneNo : index + 1,
    timeRange,
    shotRequirement,
    visual: visual || shotRequirement,
    voiceover: voiceover || stripSceneHeader(block),
    subtitle,
    materials,
    cameraMovement: readTaggedText(block, ["运镜"]) ?? "按现场素材选择固定机位或轻微推进",
    purpose: readTaggedText(block, ["目的"]) ?? "服务本镜头的信息表达",
    fallbackShot: readTaggedText(block, ["备选", "替代拍法"]) ?? "",
  };
}

function readTaggedText(text: string, tags: string[]) {
  for (const tag of tags) {
    const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = text.match(
      new RegExp(`(?:【${escapedTag}】|${escapedTag}[：:])\\s*([\\s\\S]*?)(?=\\n\\s*(?:【[^】]+】|[\\u4e00-\\u9fa5]{2,8}[：:])|$)`, "i"),
    );

    if (match?.[1]?.trim()) {
      return match[1].trim();
    }
  }

  return null;
}

function stripSceneHeader(text: string) {
  return text.replace(/^Scene\s+\d+\s*\|[^\n]*\n?/i, "").replace(/^镜头\s*\d+[：:]\s*/i, "").trim();
}

function normalizeSceneTime(value: string | undefined) {
  return value?.replace(/\s+/g, "").replace("-", " - ") ?? null;
}

function fallbackTimeRange(index: number) {
  const ranges = ["00:00 - 00:05", "00:05 - 00:18", "00:18 - 00:35", "00:35 - 00:45"];
  return ranges[index] ?? `镜头 ${index + 1}`;
}

function formatApiError(error: ApiErrorPayload | undefined, fallback: string) {
  if (error?.code === "CONTENT_VARIANT_NOT_FOUND") {
    return "当前脚本版本已刷新或失效，请刷新页面后重试，或点击重新生成脚本。";
  }

  if (error?.code === "VIDEO_SCRIPT_REVISION_TARGET_REQUIRED") {
    return "当前右侧脚本还没有准备好可修改版本，请先重新生成脚本。";
  }

  const message = error?.message ?? fallback;
  const questions = error?.details?.questions;

  if (!questions || questions.length === 0) {
    return message;
  }

  return `${message}\n${questions.map((question) => `· ${question}`).join("\n")}`;
}

function buildProductionConfig(input: {
  mode: VoiceoverMode;
  systemVoiceProvider: string;
  systemVoiceSpeaker: string;
  includeOriginalAudio: boolean;
  voiceProfiles: VoiceProfileDto[];
  selectedVoiceProfileId: string;
}) {
  if (input.mode === "voice_profile") {
    const profile = input.voiceProfiles.find((item) => item.id === input.selectedVoiceProfileId);
    if (!profile) {
      throw new Error("请选择一个可用的克隆音色，或先上传参考音频创建音色。");
    }

    return {
      voiceover: {
        enabled: true,
        mode: "voice_profile",
        voiceProfileId: profile.id,
        refAudioAssetId: profile.refAudioAssetId,
        includeOriginalAudio: input.includeOriginalAudio,
      },
      subtitles: {
        enabled: true,
        style: "platform_default",
        talkingHeadSource: "script_audio_alignment",
      },
      lipSync: {
        enabled: true,
        provider: "aliyun_videoretalk",
        scope: "talking_head_segments",
        subtitleSource: "script_audio_alignment",
        requireVoiceProfile: true,
      },
    };
  }

  return {
    voiceover: {
      enabled: true,
      mode: "system",
      provider: input.systemVoiceProvider,
      ...(input.systemVoiceSpeaker.trim() ? { speaker: input.systemVoiceSpeaker.trim() } : {}),
      includeOriginalAudio: input.includeOriginalAudio,
    },
  };
}

function getSegmentUploadStageLabel(uploadState: SegmentUploadState) {
  if (uploadState.stage === "preparing") {
    return "领凭证";
  }

  if (uploadState.stage === "finalizing") {
    return "登记素材";
  }

  return `${uploadState.progressPct}%`;
}

function updateUploadInProgressState(
  current: SegmentUploadState | undefined,
  fileName: string,
  patch: {
    stage?: DraftMediaUploadStage;
    progressPct?: number;
  },
): SegmentUploadState {
  if (current?.status && current.status !== "uploading") {
    return current;
  }

  return {
    ...(current ?? {
      status: "uploading",
      progressPct: 0,
      fileName,
    }),
    status: "uploading",
    fileName,
    ...patch,
  };
}

function getVoiceProfileUploadStageLabel(state: VoiceProfileCreateState) {
  if (state.status === "creating") {
    return "登记音色";
  }
  if (state.status === "recording") {
    return "录音中";
  }
  if (state.stage === "preparing") {
    return "领取凭证";
  }
  if (state.stage === "finalizing") {
    return "登记音频";
  }
  return "上传中";
}

function normalizeUploadPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const percent = value <= 1 ? value * 100 : value;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

function isSupportedSegmentMediaFile(file: File) {
  if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
    return true;
  }

  return /\.(avif|bmp|gif|jpe?g|m4v|mov|mp4|png|webm|webp)$/i.test(file.name);
}

function isSupportedVoiceProfileAudioFile(file: File) {
  if (file.type.startsWith("audio/")) {
    return true;
  }

  return /\.(aac|flac|m4a|mp3|ogg|opus|wav|webm)$/i.test(file.name);
}

function getSupportedRecordingMimeType() {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) {
    return "";
  }

  return (
    ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((mimeType) =>
      MediaRecorder.isTypeSupported(mimeType),
    ) ?? ""
  );
}

function stopRecordingStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function getProgressModuleStatusLabel(status: VideoEditProgressModuleDto["status"]) {
  const labels: Record<VideoEditProgressModuleDto["status"], string> = {
    pending: "等待",
    running: "处理中",
    succeeded: "完成",
    failed: "失败",
    skipped: "跳过",
  };

  return labels[status];
}

function getProgressModuleIconClass(status: VideoEditProgressModuleDto["status"]) {
  if (status === "running") {
    return "border-[#f2556b]/35 bg-[#fff0ef] text-[#f2556b]";
  }
  if (status === "succeeded") {
    return "border-emerald-500/35 bg-emerald-500/10 text-[#0f766e]";
  }
  if (status === "failed") {
    return "border-rose-500/35 bg-rose-500/10 text-rose-600";
  }
  if (status === "skipped") {
    return "border-[#eadfd7] bg-[#fffaf7] text-[#a7978e]";
  }

  return "border-[#eadfd7] bg-[#fffaf7] text-[#b2a49c]";
}

function getProgressModuleBarClass(status: VideoEditProgressModuleDto["status"]) {
  if (status === "running") {
    return "bg-[#f2556b]";
  }
  if (status === "succeeded") {
    return "bg-emerald-500";
  }
  if (status === "failed") {
    return "bg-rose-500";
  }

  return "bg-[#eadfd7]";
}

function getVideoJobToneClassNames(tone: VideoJobStatusCopyTone) {
  if (tone === "success") {
    return {
      panel: "border-emerald-500/20 bg-emerald-500/5",
      icon: "bg-emerald-500/15 text-[#0f766e]",
      message: "border border-emerald-500/20 bg-emerald-500/10 text-[#0f766e]",
      badge: "border-emerald-500/20 bg-emerald-500/10 text-[#0f766e]",
    };
  }

  if (tone === "warning") {
    return {
      panel: "border-[#f2556b]/25 bg-[#fff7ed]",
      icon: "bg-[#fff0ef] text-[#f2556b]",
      message: "border border-[#f2556b]/25 bg-[#fff0ef] text-[#8a4b00]",
      badge: "border-[#f2556b]/25 bg-[#fff0ef] text-[#f2556b]",
    };
  }

  if (tone === "danger") {
    return {
      panel: "border-rose-500/20 bg-rose-500/5",
      icon: "bg-rose-500/15 text-rose-600",
      message: "border border-rose-500/20 bg-rose-500/10 text-rose-700",
      badge: "border-rose-500/20 bg-rose-500/10 text-rose-700",
    };
  }

  return {
    panel: "border-[#f2556b]/25 bg-[#fff7ed]",
    icon: "bg-[#fff0ef] text-[#f2556b]",
    message: "border border-[#eadfd7] bg-[#fffaf7] text-[#7f7067]",
    badge: "border-[#eadfd7] bg-[#fffaf7] text-[#7f7067]",
  };
}
