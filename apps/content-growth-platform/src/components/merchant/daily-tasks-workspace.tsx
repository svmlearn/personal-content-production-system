"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { CalendarDays, FileText, Loader2, RefreshCw, Sparkles, Video } from "lucide-react";

import type { DailyContentTaskDto, DailyContentTaskItemDto, DailyContentWorkspaceDto } from "@/contracts/daily-task";
import type { ContentGenerationBatchDto } from "@/contracts/content-generation";

type ApiErrorPayload = {
  error?: {
    message?: string;
  };
};

export function DailyTasksWorkspace() {
  const [workspace, setWorkspace] = useState<DailyContentWorkspaceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);
  const [generationBusy, setGenerationBusy] = useState(false);

  async function loadWorkspace() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/daily-content-tasks", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const data = (await response.json().catch(() => null)) as
        | (DailyContentWorkspaceDto & ApiErrorPayload)
        | null;

      if (!response.ok || !data?.today) {
        throw new Error(data?.error?.message ?? "今日内容加载失败");
      }

      setWorkspace(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "今日内容加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function startDifyWeekGeneration() {
    if (!workspace) {
      return;
    }

    setGenerationBusy(true);
    setError(null);
    setGenerationNotice(null);

    try {
      const response = await fetch("/api/content-generation/batches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          date: workspace.today.taskDate,
          days: 7,
          memberScope: workspace.role === "owner" ? "active_members" : "self",
        }),
      });
      const data = (await response.json().catch(() => null)) as
        | ({ batch?: ContentGenerationBatchDto; jobs?: unknown[] } & ApiErrorPayload)
        | null;

      if (!response.ok || !data?.batch) {
        throw new Error(data?.error?.message ?? "Dify 批量生成任务创建失败");
      }

      setGenerationNotice(
        `已创建 ${data.jobs?.length ?? data.batch.totalJobs} 个 Dify 生成任务，可刷新查看生成状态。`,
      );
      await loadWorkspace();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Dify 批量生成任务创建失败");
    } finally {
      setGenerationBusy(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadWorkspace();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[#9b8d84]">
        正在准备今日内容...
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="max-w-md rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-center">
          <p className="text-lg text-rose-700">今日内容暂时不可用</p>
          <p className="mt-3 text-sm leading-7 text-rose-700/75">
            {error ?? "项目内容素材正在补充中，可稍后重试。"}
          </p>
          <button
            type="button"
            onClick={() => {
              void loadWorkspace();
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#eadfd7] bg-[#fff0ef] px-4 py-2 text-xs text-[#3d332f]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            重新加载
          </button>
        </div>
      </div>
    );
  }

  const today = workspace.today;
  const articleHref = `/dashboard/today/article/${today.id}`;
  const videoHref = `/dashboard/today/video/${today.id}`;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-16 items-center justify-between border-b border-[#eadfd7] px-6">
        <div>
          <h1 className="text-xl tracking-tight [font-family:var(--font-cormorant)]">今日内容</h1>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#9b8d84]">
            Team content calendar
          </p>
        </div>
        <div className="flex items-center gap-2">
          {workspace.role === "owner" ? (
            <Link
              href="/dashboard/consultation"
              className="rounded-full border border-[#f2556b]/25 bg-[#fff0ef] px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[#f2556b]"
            >
              团队选题
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => {
              void startDifyWeekGeneration();
            }}
            disabled={generationBusy}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[#0f766e] disabled:opacity-50"
          >
            {generationBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {workspace.role === "owner" ? "生成团队本周内容" : "生成本周"}
          </button>
          <button
            type="button"
            onClick={() => {
              void loadWorkspace();
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[#eadfd7] bg-[#fffaf7] px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[#7f7067]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            刷新
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6 lg:p-8">
        {generationNotice ? (
          <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-[#0f766e]">
            {generationNotice}
          </div>
        ) : null}
        <section className="rounded-3xl border border-[#eadfd7] bg-white p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f2556b]/25 bg-[#fff0ef] px-3 py-1 text-xs text-[#c46a00]">
                <Sparkles className="h-3.5 w-3.5" />
                {today.taskDate}
              </div>
              <h2 className="mt-4 text-3xl tracking-tight text-[#1f2328] [font-family:var(--font-cormorant)]">
                {today.theme}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7f7067]">
                今天给你准备了 1 条图文内容和 1 条视频脚本。它们来自团队内容日历，但标题、表达角度和素材组合会按账号稳定分配，成员端只需要照着拍、上传素材并一键剪辑。
              </p>
            </div>
            <div className="rounded-2xl border border-[#eadfd7] bg-[#fffaf7] px-4 py-3 text-sm text-[#7f7067]">
              来源：{readSourceLabel(today.teamCalendarSource)}
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <TaskCard
            icon={<FileText className="h-5 w-5" />}
            eyebrow="图文任务"
            title={today.articleTask.title}
            summary={today.articleTask.summary}
            materialHints={today.articleTask.materialHints}
            generationStatus={today.articleTask.generationStatus}
            href={articleHref}
            actionLabel="查看图文"
          />
          <TaskCard
            icon={<Video className="h-5 w-5" />}
            eyebrow="视频任务"
            title={today.videoTask.title}
            summary={today.videoTask.summary}
            materialHints={today.videoTask.materialHints}
            generationStatus={today.videoTask.generationStatus}
            href={videoHref}
            actionLabel="看脚本并上传素材"
          />
        </div>

        <section className="mt-6 rounded-3xl border border-[#eadfd7] bg-white">
          <div className="flex items-center gap-3 border-b border-[#eadfd7] px-6 py-4">
            <CalendarDays className="h-4 w-4 text-[#9b8d84]" />
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#9b8d84]">未来 7 天</p>
          </div>
          <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
            {workspace.upcoming.map((task) => (
              <FutureTaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function FutureTaskCard({ task }: { task: DailyContentTaskDto }) {
  const articleReady = isGeneratedContentItem(task.articleTask);
  const videoReady = isGeneratedContentItem(task.videoTask);

  return (
    <article className="flex min-h-[180px] flex-col rounded-2xl border border-[#eadfd7] bg-[#fffaf7] p-4 transition hover:border-[#f2556b]/25 hover:bg-white">
      <p className="text-[10px] uppercase tracking-[0.22em] text-[#9b8d84]">
        {task.taskDate}
      </p>
      <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-[#3d332f]">
        {task.theme}
      </p>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#9b8d84]">
        {task.articleTask.title}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <GenerationStatusBadge status={task.articleTask.generationStatus} />
        {task.videoTask.generationStatus && task.videoTask.generationStatus !== task.articleTask.generationStatus ? (
          <GenerationStatusBadge status={task.videoTask.generationStatus} labelPrefix="视频" />
        ) : null}
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <FutureTaskAction
          href={`/dashboard/today/article/${task.id}`}
          label="查看图文"
          ready={articleReady}
        />
        <FutureTaskAction
          href={`/dashboard/today/video/${task.id}`}
          label="看脚本"
          ready={videoReady}
        />
      </div>
    </article>
  );
}

function FutureTaskAction({
  href,
  label,
  ready,
}: {
  href: string;
  label: string;
  ready: boolean;
}) {
  if (!ready) {
    return (
      <span className="rounded-full border border-[#eadfd7] bg-white/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[#b7aaa2]">
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="rounded-full border border-[#f2556b]/25 bg-[#fff0ef] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[#f2556b] transition hover:border-[#f2556b]/40 hover:bg-[#ffe8e5]"
    >
      {label}
    </Link>
  );
}

function TaskCard({
  icon,
  eyebrow,
  title,
  summary,
  materialHints,
  generationStatus,
  href,
  actionLabel,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  summary: string;
  materialHints: string[];
  generationStatus?: DailyContentWorkspaceDto["today"]["articleTask"]["generationStatus"];
  href: string;
  actionLabel: string;
}) {
  return (
    <section className="rounded-3xl border border-[#eadfd7] bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#f2556b]/25 bg-[#fff0ef] text-[#c46a00]">
            {icon}
          </div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#9b8d84]">{eyebrow}</p>
        </div>
        <Link
          href={href}
          className="rounded-full border border-[#f2556b]/25 bg-[#fff0ef] px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[#f2556b]"
        >
          {actionLabel}
        </Link>
      </div>
      <h3 className="mt-5 text-xl leading-7 text-[#1f2328]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#7f7067]">{summary}</p>
      <div className="mt-4">
        <GenerationStatusBadge status={generationStatus} />
      </div>
      {materialHints.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {materialHints.slice(0, 4).map((item) => (
            <span key={item} className="rounded-full border border-[#eadfd7] bg-[#fffaf7] px-3 py-1 text-xs text-[#8b7b72]">
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function GenerationStatusBadge({
  status,
  labelPrefix,
}: {
  status?: DailyContentWorkspaceDto["today"]["articleTask"]["generationStatus"];
  labelPrefix?: string;
}) {
  if (!status || status === "not_started") {
    return null;
  }

  const labels: Record<NonNullable<typeof status>, string> = {
    pending: "Dify 队列中",
    running: "Dify 生成中",
    succeeded: "Dify 已生成",
    failed: "Dify 失败",
  };

  return (
    <span className="inline-flex rounded-full border border-[#eadfd7] bg-[#fffaf7] px-3 py-1 text-xs text-[#8b7b72]">
      {labelPrefix ? `${labelPrefix} · ` : ""}
      {labels[status]}
    </span>
  );
}

function isGeneratedContentItem(item: DailyContentTaskItemDto) {
  return (
    item.generationStatus === "succeeded" ||
    Boolean(item.generatedArticle) ||
    Boolean(item.generatedVideoScript) ||
    Boolean(item.contentDraftId && item.contentVariantId)
  );
}

function readSourceLabel(source: Record<string, unknown>) {
  const value = source.source;
  return typeof value === "string" && value ? value : "团队内容日历";
}
