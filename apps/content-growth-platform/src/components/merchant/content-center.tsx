"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  FileText,
  Filter,
  ImageIcon,
  Library,
  Link2,
  Play,
  Plus,
  Search,
  User,
  Video,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { MaterialLibraryItemDto, MaterialPlatform, MaterialType } from "@/contracts/material";

const platforms = ["xiaohongshu", "douyin"] as const;
const platformFilterOptions = ["all", ...platforms] as const;
const materialTypeFilterOptions = ["all", "article", "video"] as const;
const platformLabels: Record<MaterialPlatform, string> = {
  xiaohongshu: "小红书",
  douyin: "抖音",
};
const materialTypeLabels: Record<MaterialType, string> = {
  article: "图文",
  video: "视频",
};
const sourceKindLabels = {
  uploaded: "单条解析",
  benchmark: "TikHub解析",
} as const;

type FindMethod = "keyword" | "profile" | "detail";
type FindCount = "5" | "20" | "50" | "all";
type PlatformFilter = (typeof platformFilterOptions)[number];
type MaterialTypeFilter = (typeof materialTypeFilterOptions)[number];

const materialTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function MerchantContentCenter() {
  const [materials, setMaterials] = useState<MaterialLibraryItemDto[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [materialTypeFilter, setMaterialTypeFilter] = useState<MaterialTypeFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFindModal, setShowFindModal] = useState(false);

  const [uploadPlatform, setUploadPlatform] = useState<MaterialPlatform>("xiaohongshu");
  const [uploadLink, setUploadLink] = useState("");
  const [isParsing, setIsParsing] = useState(false);

  const [findPlatform, setFindPlatform] = useState<MaterialPlatform>("xiaohongshu");
  const [findMethod, setFindMethod] = useState<FindMethod>("keyword");
  const [findKeyword, setFindKeyword] = useState("");
  const [findCount, setFindCount] = useState<FindCount>("5");
  const [findProfileUrl, setFindProfileUrl] = useState("");
  const [findDetailUrl, setFindDetailUrl] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const filteredMaterials = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return materials;
    }

    return materials.filter((item) =>
      [
        item.title,
        platformLabels[item.platform],
        sourceKindLabels[item.sourceKind],
        item.description ?? "",
      ].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [materials, query]);

  const selectedItem =
    filteredMaterials.find((item) => item.id === selectedId) ?? filteredMaterials[0] ?? null;
  const selectedMetrics = selectedItem ? getEngagementMetrics(selectedItem) : [];
  const selectedComments = selectedItem ? getMaterialComments(selectedItem).slice(0, 8) : [];
  const selectedTags = selectedItem ? getMaterialTags(selectedItem).slice(0, 12) : [];
  const selectedProviderSummary = selectedItem ? getProviderSummary(selectedItem) : [];
  const selectedMediaAssets = selectedItem ? getPreviewableMediaAssets(selectedItem) : [];

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: "100",
        usageType: "viral_reference",
      });
      if (platformFilter !== "all") {
        params.set("platform", platformFilter);
      }
      if (materialTypeFilter !== "all") {
        params.set("materialType", materialTypeFilter);
      }

      const response = await fetch(`/api/materials?${params.toString()}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        materials?: MaterialLibraryItemDto[];
        error?: { message?: string };
      };

      if (!response.ok) {
        throw new Error(data.error?.message ?? "素材读取失败");
      }

      const nextMaterials = (data.materials ?? []).filter(
        (item) => item.usageType === "viral_reference",
      );
      setMaterials(nextMaterials);
      setSelectedId((currentSelectedId) =>
        currentSelectedId && nextMaterials.some((item) => item.id === currentSelectedId)
          ? currentSelectedId
          : nextMaterials[0]?.id ?? null,
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "素材读取失败");
    } finally {
      setLoading(false);
    }
  }, [materialTypeFilter, platformFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMaterials();
  }, [loadMaterials]);

  async function handleUploadParse() {
    const nextLink = uploadLink.trim();
    if (!nextLink) {
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      const response = await fetch("/api/materials", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          platform: uploadPlatform,
          url: nextLink,
        }),
      });
      const data = (await response.json()) as {
        material?: MaterialLibraryItemDto;
        error?: { message?: string };
      };

      if (!response.ok || !data.material) {
        throw new Error(data.error?.message ?? "素材提交失败");
      }

      setPlatformFilter(data.material.platform);
      setMaterialTypeFilter(data.material.materialType);
      setMaterials((current) => [data.material!, ...current]);
      setSelectedId(data.material.id);
      setShowUploadModal(false);
      setUploadLink("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "素材提交失败");
    } finally {
      setIsParsing(false);
    }
  }

  async function handleBenchmarkSearch() {
    const searchTarget =
      findMethod === "keyword"
        ? findKeyword.trim()
        : findMethod === "profile"
          ? findProfileUrl.trim()
          : findDetailUrl.trim();
    if (!searchTarget) {
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch("/api/materials/benchmark-search", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          platform: findPlatform,
          findMethod,
          keyword: findMethod === "keyword" ? searchTarget : undefined,
          profileUrl: findMethod === "profile" ? searchTarget : undefined,
          detailUrl: findMethod === "detail" ? searchTarget : undefined,
          count:
            findMethod === "detail"
              ? 1
              : findMethod === "profile" && findCount === "all"
                ? undefined
                : findCount === "all" ? 5 : Number(findCount),
          fetchAll: findMethod === "profile" && findCount === "all",
        }),
      });
      const data = (await response.json()) as {
        materials?: MaterialLibraryItemDto[];
        error?: { message?: string };
      };

      if (!response.ok || !data.materials) {
        throw new Error(data.error?.message ?? "社媒爆款内容检索失败");
      }

      setPlatformFilter(findPlatform);
      setMaterialTypeFilter("all");
      setMaterials((current) => [...data.materials!, ...current]);
      setSelectedId(data.materials[0]?.id ?? null);
      setShowFindModal(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "社媒爆款内容检索失败");
    } finally {
      setIsSearching(false);
    }
  }

  function handleFindMethodChange(nextMethod: FindMethod) {
    setFindMethod(nextMethod);
    if (nextMethod !== "profile" && findCount === "all") {
      setFindCount("5");
    }
  }

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col bg-transparent">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#eadfd7] px-6">
        <div>
          <h1 className="text-xl tracking-tight [font-family:var(--font-cormorant)]">
            社媒爆款内容库
          </h1>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#9b8d84]">
            TikHub 解析内容 · 正文评论互动数据
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#eadfd7] bg-[#fffaf7] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[#5f514a] transition-colors hover:bg-[#fff0ef] hover:text-[#1f2328]"
          >
            <Plus className="h-3.5 w-3.5" />
            解析单条
          </button>
          <button
            type="button"
            onClick={() => setShowFindModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#f2556b] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[#fffaf7] shadow-[0_18px_60px_rgba(242,85,107,0.16)] transition-colors hover:bg-[#e94b73]"
          >
            <Search className="h-3.5 w-3.5" />
            找爆款
          </button>
        </div>
      </header>

      {error ? (
        <div className="border-b border-rose-500/20 bg-rose-500/10 px-6 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-[#9b8d84]">
          正在读取素材库...
        </div>
      ) : materials.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-[#eadfd7] bg-[#fffaf7] text-[#c46a00]">
            <Library className="h-10 w-10" />
          </div>
          <h2 className="text-2xl text-[#1f2328] [font-family:var(--font-cormorant)]">
            社媒爆款内容库为空
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#9b8d84] [font-family:var(--font-cormorant)]">
            这里只沉淀小红书和抖音的社媒爆款内容，包括正文、标签、互动数据和评论。项目图片和项目视频素材继续留在资料库，不放进这里。
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="rounded-xl border border-[#eadfd7] bg-[#fffaf7] px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-[#4f433d] transition-colors hover:bg-[#fff0ef] hover:text-[#1f2328]"
            >
              解析单条
            </button>
            <button
              type="button"
              onClick={() => setShowFindModal(true)}
              className="rounded-xl bg-[#f2556b] px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-[#fffaf7] shadow-[0_18px_60px_rgba(242,85,107,0.18)] transition-colors hover:bg-[#e94b73]"
            >
              去找爆款
            </button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          <aside className="flex h-[340px] shrink-0 flex-col border-b border-[#eadfd7] bg-[#fffaf6] lg:h-full lg:w-[400px] lg:border-b-0 lg:border-r">
            <div className="space-y-3 border-b border-[#eadfd7]/70 p-5">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b8d84]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    type="text"
                    placeholder="搜索标题、正文、作者..."
                    className="h-10 w-full rounded-xl border border-[#eadfd7] bg-[#fffaf7] pl-11 pr-4 text-xs text-[#1f2328] outline-none placeholder:text-[#b2a49c] focus:border-[#f2556b]/50"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPlatformFilter("all");
                    setMaterialTypeFilter("all");
                    setQuery("");
                  }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#eadfd7] bg-[#fffaf7] text-[#7f7067] transition-colors hover:bg-[#fffaf7] hover:text-[#1f2328]"
                  aria-label="重置筛选"
                >
                  <Filter className="h-4 w-4" />
                </button>
              </div>
              <InlineFilterGroup
                options={platformFilterOptions}
                value={platformFilter}
                onChange={setPlatformFilter}
              />
              <InlineFilterGroup
                options={materialTypeFilterOptions}
                value={materialTypeFilter}
                onChange={setMaterialTypeFilter}
              />
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
              {filteredMaterials.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const primaryAsset = getPrimaryPreviewAsset(item);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "flex w-full gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all",
                      isSelected
                        ? "border-[#f2556b]/40 bg-[#fff0ef] shadow-[0_18px_70px_rgba(242,85,107,0.12)]"
                        : "border-[#eadfd7] bg-[#fffaf7] hover:border-[#eadfd7] hover:bg-[#fff5f1]",
                    )}
                  >
                    <MaterialThumbnail item={item} asset={primaryAsset} selected={isSelected} size="list" />
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm leading-snug text-[#1f2328] [font-family:var(--font-cormorant)]">
                        {item.title}
                      </h3>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em]">
                        <span className="rounded border border-[#eadfd7] bg-[#fffaf7] px-2 py-1 text-[#7f7067]">
                          {platformLabels[item.platform]}
                        </span>
                        <span className="rounded border border-[#eadfd7] bg-[#fffaf7] px-2 py-1 text-[#7f7067]">
                          {materialTypeLabels[item.materialType]}
                        </span>
                        <span className="rounded border border-[#f2556b]/25 bg-[#fff0ef] px-2 py-1 text-[#f2556b]">
                          {item.engagementLabel ?? "待分析"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredMaterials.length === 0 ? (
                <div className="rounded-2xl border border-[#eadfd7] bg-[#fffaf7] p-6 text-center text-sm text-[#9b8d84]">
                  没找到匹配素材，可以换个关键词。
                </div>
              ) : null}
            </div>
          </aside>

          <main className="min-h-0 flex-1 overflow-y-auto p-6 lg:p-10">
            {selectedItem ? (
              <div className="mx-auto flex min-h-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[#eadfd7] bg-white shadow-[0_24px_100px_rgba(77,53,43,0.10)]">
                <section className="flex items-start justify-between gap-6 border-b border-[#eadfd7] bg-[#fffaf7] p-8">
                  <div className="flex gap-5">
                    <MaterialThumbnail
                      item={selectedItem}
                      asset={getPrimaryPreviewAsset(selectedItem)}
                      selected
                      size="detail"
                    />
                    <div>
                      <h2 className="text-2xl leading-snug text-[#1f2328] [font-family:var(--font-cormorant)]">
                        {selectedItem.title}
                      </h2>
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
                        <span className="rounded border border-[#eadfd7] bg-[#fffaf7] px-2 py-1 text-[#7f7067]">
                          {platformLabels[selectedItem.platform]}
                        </span>
                        <span className="rounded border border-[#eadfd7] bg-[#fffaf7] px-2 py-1 text-[#7f7067]">
                          {materialTypeLabels[selectedItem.materialType]}
                        </span>
                        <span className="rounded border border-[#f2556b]/25 bg-[#fff0ef] px-2 py-1 text-[#f2556b]">
                          {selectedItem.engagementLabel ?? "待分析"}
                        </span>
                        <span className="text-[#a7978e]">{sourceKindLabels[selectedItem.sourceKind]}</span>
                        <span className="text-[#b2a49c]">{formatMaterialTime(selectedItem.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  {selectedItem.originalUrl ? (
                    <a
                      href={selectedItem.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#9b8d84] transition-colors hover:text-[#f2556b]"
                    >
                      原文链接
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </section>

                <section className="min-h-[260px] flex-1 space-y-8 p-8 text-sm leading-8 text-[#1f2328] [font-family:var(--font-cormorant)]">
                  {selectedMediaAssets.length > 0 ? (
                    <div>
                      <h3 className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#9b8d84]">
                        媒体预览
                      </h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        {selectedMediaAssets.map((asset) => (
                          <MaterialMediaPreview key={asset.id} asset={asset} />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <h3 className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#9b8d84]">
                      正文 / 文案
                    </h3>
                    <div className="whitespace-pre-wrap text-base leading-8">
                      {selectedItem.description || "TikHub 暂未返回正文。"}
                    </div>
                  </div>

                  {selectedTags.length > 0 ? (
                    <div>
                      <h3 className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#9b8d84]">
                        标签
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded border border-[#eadfd7] bg-[#fffaf7] px-2.5 py-1 text-xs text-[#6f625d]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {selectedMetrics.length > 0 ? (
                    <div>
                      <h3 className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#9b8d84]">
                        互动数据
                      </h3>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {selectedMetrics.map((metric) => (
                          <div key={metric.label} className="rounded-xl border border-[#eadfd7] bg-[#fffaf7] p-4">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-[#9b8d84]">
                              {metric.label}
                            </div>
                            <div className="mt-2 text-xl text-[#f2556b]">{metric.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <h3 className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#9b8d84]">
                      评论
                    </h3>
                    {selectedComments.length > 0 ? (
                      <div className="space-y-3">
                        {selectedComments.map((comment, index) => (
                          <div
                            key={`${comment.externalCommentId ?? comment.content}-${index}`}
                            className="rounded-xl border border-[#eadfd7] bg-[#fffaf7] p-4"
                          >
                            <div className="mb-2 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.18em] text-[#9b8d84]">
                              <span>{comment.authorName || "匿名用户"}</span>
                              <span>{formatCommentStats(comment)}</span>
                            </div>
                            <p className="text-sm leading-7 text-[#5f514a]">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#9b8d84]">
                        本条内容暂未保存评论，可能是平台风控字段缺失或 TikHub 评论接口未返回。
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#9b8d84]">
                      TikHub 解析字段
                    </h3>
                    <div className="grid gap-2 text-xs text-[#7f7067] md:grid-cols-2">
                      {selectedProviderSummary.map((row) => (
                        <div key={row.label} className="rounded-lg border border-[#eadfd7] bg-[#fffaf7] px-3 py-2">
                          <span className="text-[#9b8d84]">{row.label}：</span>
                          <span>{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-xs leading-6 text-[#a7978e]">
                      原始 TikHub payload 已随内容保存，普通用户页面不展示 raw JSON。
                    </p>
                  </div>
                </section>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm italic text-[#9b8d84] [font-family:var(--font-cormorant)]">
                请选择左侧素材。
              </div>
            )}
          </main>
        </div>
      )}

      {showUploadModal ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#4f433d]/35 p-6 backdrop-blur-sm">
          <div className="flex w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[#eadfd7] bg-[#fffaf6] shadow-[0_24px_120px_rgba(77,53,43,0.18)]">
            <ModalHeader title="解析单条爆款内容" onClose={() => setShowUploadModal(false)} />
            <div className="space-y-6 p-8">
              <OptionGroup
                label="选择平台"
                options={platforms}
                value={uploadPlatform}
                onChange={setUploadPlatform}
              />
              <div>
                <label className="mb-3 block text-[10px] uppercase tracking-[0.22em] text-[#7f7067]">
                  单条内容链接
                </label>
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a7978e]" />
                  <input
                    value={uploadLink}
                    onChange={(event) => setUploadLink(event.target.value)}
                    type="text"
                    placeholder="粘贴小红书笔记或抖音视频链接..."
                    className="w-full rounded-xl border border-[#eadfd7] bg-[#fffaf7] py-3 pl-12 pr-4 text-sm text-[#1f2328] outline-none placeholder:text-[#b2a49c] focus:border-[#f2556b]/50"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleUploadParse}
                  disabled={!uploadLink.trim() || isParsing}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#f2556b] px-6 py-3 text-[10px] uppercase tracking-[0.22em] text-[#fffaf7] transition-colors hover:bg-[#e94b73] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isParsing ? <Search className="h-3.5 w-3.5 animate-spin" /> : null}
                  {isParsing ? "解析中..." : "解析入库"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showFindModal ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#4f433d]/35 p-6 backdrop-blur-sm">
          <div className="flex w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[#eadfd7] bg-[#fffaf6] shadow-[0_24px_120px_rgba(77,53,43,0.18)]">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#eadfd7] bg-[#fffaf7] px-8 pt-4">
              <div className="flex">
                {[
                  ["keyword", "关键词"],
                  ["profile", "博主主页"],
                  ["detail", "单条链接"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleFindMethodChange(value as FindMethod)}
                    className={cn(
                      "relative px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors",
                      findMethod === value ? "text-[#f2556b]" : "text-[#9b8d84] hover:text-[#4f433d]",
                    )}
                  >
                    {label}
                    {findMethod === value ? (
                      <span className="absolute bottom-0 left-0 h-px w-full bg-[#f2556b]" />
                    ) : null}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowFindModal(false)}
                className="mb-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#eadfd7] bg-[#fffaf7] text-[#8b7b72] transition-colors hover:border-[#f2556b]/40 hover:bg-[#fff0ef] hover:text-[#f2556b]"
                aria-label="关闭社媒爆款检索弹窗"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6 p-8">
              <OptionGroup
                label="目标平台"
                options={platforms}
                value={findPlatform}
                onChange={setFindPlatform}
              />

              {findMethod === "keyword" ? (
                <>
                  <div>
                    <label className="mb-3 block text-[10px] uppercase tracking-[0.22em] text-[#7f7067]">
                      搜索关键词
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a7978e]" />
                      <input
                        value={findKeyword}
                        onChange={(event) => setFindKeyword(event.target.value)}
                        type="text"
                        placeholder="例如：普拉提 产后修复"
                        className="w-full rounded-xl border border-[#eadfd7] bg-[#fffaf7] py-3 pl-12 pr-4 text-sm text-[#1f2328] outline-none placeholder:text-[#b2a49c] focus:border-[#f2556b]/50"
                      />
                    </div>
                  </div>
                  <OptionGroup
                    label="寻找数量"
                    options={["5", "20", "50"] as const}
                    value={findCount}
                    onChange={setFindCount}
                    suffix="篇"
                  />
                </>
              ) : findMethod === "profile" ? (
                <div>
                  <label className="mb-3 block text-[10px] uppercase tracking-[0.22em] text-[#7f7067]">
                    博主主页链接
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a7978e]" />
                    <input
                      value={findProfileUrl}
                      onChange={(event) => setFindProfileUrl(event.target.value)}
                      type="text"
                      placeholder="粘贴博主主页链接..."
                      className="w-full rounded-xl border border-[#eadfd7] bg-[#fffaf7] py-3 pl-12 pr-4 text-sm text-[#1f2328] outline-none placeholder:text-[#b2a49c] focus:border-[#f2556b]/50"
                    />
                  </div>
                  <p className="mt-3 text-xs leading-6 text-[#9b8d84]">
                    会优先拉取该博主近期互动表现更好的内容，供咨询和选题 Agent 查询。
                  </p>
                  <div className="mt-6">
                    <OptionGroup
                      label="导入数量"
                      options={["5", "20", "50", "all"] as const}
                      value={findCount}
                      onChange={setFindCount}
                      suffix="篇"
                    />
                    <p className="mt-3 text-xs leading-6 text-[#a7978e]">
                      全量会分页拉取，当前服务器有保护上限，避免一次性请求过多。
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-3 block text-[10px] uppercase tracking-[0.22em] text-[#7f7067]">
                    单条内容链接
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a7978e]" />
                    <input
                      value={findDetailUrl}
                      onChange={(event) => setFindDetailUrl(event.target.value)}
                      type="text"
                      placeholder="粘贴小红书笔记或抖音视频链接..."
                      className="w-full rounded-xl border border-[#eadfd7] bg-[#fffaf7] py-3 pl-12 pr-4 text-sm text-[#1f2328] outline-none placeholder:text-[#b2a49c] focus:border-[#f2556b]/50"
                    />
                  </div>
                  <p className="mt-3 text-xs leading-6 text-[#9b8d84]">
                    单条链接会解析正文、互动数据和评论；视频不会进入视频剪辑素材库。
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleBenchmarkSearch}
                  disabled={
                    isSearching ||
                    (findMethod === "keyword" && !findKeyword.trim()) ||
                    (findMethod === "profile" && !findProfileUrl.trim()) ||
                    (findMethod === "detail" && !findDetailUrl.trim())
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-[#f2556b] px-6 py-3 text-[10px] uppercase tracking-[0.22em] text-[#fffaf7] transition-colors hover:bg-[#e94b73] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSearching ? <Search className="h-3.5 w-3.5 animate-spin" /> : null}
                  {isSearching ? "解析中..." : "开始解析"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type MaterialMediaAsset = NonNullable<MaterialLibraryItemDto["mediaAssets"]>[number];

function MaterialThumbnail({
  item,
  asset,
  selected,
  size,
}: {
  item: MaterialLibraryItemDto;
  asset?: MaterialMediaAsset | null;
  selected?: boolean;
  size: "list" | "detail";
}) {
  const previewUrl = asset ? getAssetPreviewUrl(asset) : null;
  const Icon = item.materialType === "article" ? FileText : Video;
  const className = cn(
    "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border",
    size === "list" ? "h-16 w-16" : "h-14 w-14",
    selected
      ? "border-[#f2556b]/25 bg-[#fff0ef] text-[#f2556b]"
      : "border-[#eadfd7] bg-[#fffaf7] text-[#9b8d84]",
  );

  if (previewUrl && asset && isImagePreviewAsset(asset)) {
    return (
      <div className={className}>
        <img
          src={previewUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {asset.assetType === "cover" ? (
          <div className="absolute bottom-1 right-1 rounded bg-white/85 p-1 text-[#f2556b] shadow-[0_6px_16px_rgba(77,53,43,0.14)]">
            <Video className="h-3 w-3" />
          </div>
        ) : null}
      </div>
    );
  }

  if (previewUrl && asset && isVideoPreviewAsset(asset)) {
    return (
      <div className={className}>
        <video
          src={previewUrl}
          className="h-full w-full bg-[#f3ede7] object-cover"
          muted
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-[#f2556b]">
          <Play className="h-4 w-4 fill-current" />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Icon className="h-6 w-6" />
    </div>
  );
}

function MaterialMediaPreview({ asset }: { asset: MaterialMediaAsset }) {
  const previewUrl = getAssetPreviewUrl(asset);

  if (!previewUrl) {
    return null;
  }

  const isVideo = isVideoPreviewAsset(asset);
  const isImage = isImagePreviewAsset(asset);

  return (
    <div className="overflow-hidden rounded-xl border border-[#eadfd7] bg-[#fffaf7]">
      <div className={cn("relative w-full bg-[#fffaf7]", isVideo ? "aspect-video" : "aspect-square")}>
        {isVideo ? (
          <video
            src={previewUrl}
            className="h-full w-full object-contain"
            controls
            playsInline
            preload="metadata"
          />
        ) : isImage ? (
          <a href={previewUrl} target="_blank" rel="noreferrer" className="block h-full w-full">
            <img
              src={previewUrl}
              alt=""
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </a>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#9b8d84]">
            <FileText className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="flex min-h-10 items-center justify-between gap-3 border-t border-[#eadfd7] px-3 py-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[#8b7b72]">
          {isVideo ? <Video className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
          {formatAssetTypeLabel(asset)}
        </span>
        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#eadfd7] bg-[#fffaf7] text-[#8b7b72] transition-colors hover:border-[#f2556b]/40 hover:bg-[#fff0ef] hover:text-[#f2556b]"
          aria-label="打开媒体预览"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

function getPrimaryPreviewAsset(item: MaterialLibraryItemDto): MaterialMediaAsset | null {
  const assets = getPreviewableMediaAssets(item);

  return (
    assets.find((asset) => asset.assetType === "cover") ??
    assets.find(isImagePreviewAsset) ??
    assets.find(isVideoPreviewAsset) ??
    null
  );
}

function getPreviewableMediaAssets(item: MaterialLibraryItemDto): MaterialMediaAsset[] {
  return [...(item.mediaAssets ?? [])]
    .filter((asset) => Boolean(getAssetPreviewUrl(asset)))
    .filter((asset) => isImagePreviewAsset(asset) || isVideoPreviewAsset(asset))
    .sort((left, right) => getAssetDisplayPriority(left) - getAssetDisplayPriority(right));
}

function getAssetDisplayPriority(asset: MaterialMediaAsset) {
  if (isVideoPreviewAsset(asset)) return 0;
  if (asset.assetType === "cover") return 1;
  if (isImagePreviewAsset(asset)) return 2;
  return 3;
}

function getAssetPreviewUrl(asset: MaterialMediaAsset) {
  return asset.signedPreviewUrl ?? asset.originUrl ?? null;
}

function isImagePreviewAsset(asset: MaterialMediaAsset) {
  return (
    asset.assetType === "image" ||
    asset.assetType === "cover" ||
    asset.mimeType?.toLowerCase().startsWith("image/") === true
  );
}

function isVideoPreviewAsset(asset: MaterialMediaAsset) {
  return asset.assetType === "video" || asset.mimeType?.toLowerCase().startsWith("video/") === true;
}

function formatAssetTypeLabel(asset: MaterialMediaAsset) {
  if (asset.assetType === "cover") return "封面";
  if (isVideoPreviewAsset(asset)) return "视频";
  if (isImagePreviewAsset(asset)) return "图片";
  return "媒体";
}

type DisplayComment = {
  externalCommentId?: string | null;
  authorName?: string | null;
  content: string;
  likeCount?: number | null;
  replyCount?: number | null;
};

function getEngagementMetrics(item: MaterialLibraryItemDto) {
  const engagement = toRecord(item.analysisPayload.engagementSnapshot);
  const metricMap: Array<[string, string]> = [
    ["likedCount", "点赞"],
    ["commentCount", "评论"],
    ["collectedCount", "收藏"],
    ["shareCount", "转发"],
    ["playCount", "播放"],
  ];

  return metricMap.flatMap(([key, label]) => {
    const value = engagement[key];
    return typeof value === "number" && Number.isFinite(value)
      ? [{ label, value: formatLargeNumber(value) }]
      : [];
  });
}

function getMaterialComments(item: MaterialLibraryItemDto): DisplayComment[] {
  const tracePayload = toRecord(item.analysisPayload.tracePayload);
  const comments = tracePayload.materialComments;

  if (!Array.isArray(comments)) {
    return [];
  }

  return comments.flatMap((comment) => {
    const record = toRecord(comment);
    const content = typeof record.content === "string" ? record.content.trim() : "";

    if (!content) {
      return [];
    }

    return [{
      externalCommentId: typeof record.externalCommentId === "string" ? record.externalCommentId : null,
      authorName: typeof record.authorName === "string" ? record.authorName : null,
      content,
      likeCount: typeof record.likeCount === "number" ? record.likeCount : null,
      replyCount: typeof record.replyCount === "number" ? record.replyCount : null,
    }];
  });
}

function getMaterialTags(item: MaterialLibraryItemDto) {
  const structureSummary = toRecord(item.analysisPayload.structureSummary);
  const tags = structureSummary.tags;

  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((tag) => typeof tag === "string" ? tag.replace(/^#/, "").trim() : "")
    .filter(Boolean);
}

function getProviderSummary(item: MaterialLibraryItemDto) {
  const structureSummary = toRecord(item.analysisPayload.structureSummary);
  const tracePayload = toRecord(item.analysisPayload.tracePayload);
  const benchmark = toRecord(tracePayload.materialBenchmark);
  const rows = [
    { label: "来源方式", value: formatFindMethod(typeof benchmark.findMethod === "string" ? benchmark.findMethod : "") },
    { label: "内容形态", value: item.materialType === "video" ? "视频" : "图文" },
    { label: "Provider", value: typeof structureSummary.provider === "string" ? structureSummary.provider : "tikhub" },
    { label: "评论状态", value: formatCommentFetchStatus(toRecord(tracePayload.materialCommentFetch)) },
  ];

  return rows.filter((row) => Boolean(row.value));
}

function formatFindMethod(value: string) {
  if (value === "keyword") return "关键词";
  if (value === "profile") return "博主主页";
  if (value === "detail") return "单条链接";
  return "";
}

function formatCommentFetchStatus(value: Record<string, unknown>) {
  if (value.status === "ready") return `已保存 ${typeof value.count === "number" ? value.count : 0} 条`;
  if (value.status === "empty") return "未返回评论";
  if (value.status === "skipped") return "缺少评论接口必要参数";
  if (value.status === "failed") return "拉取失败";
  return "";
}

function formatCommentStats(comment: DisplayComment) {
  const parts = [
    typeof comment.likeCount === "number" ? `赞 ${formatLargeNumber(comment.likeCount)}` : null,
    typeof comment.replyCount === "number" ? `回复 ${formatLargeNumber(comment.replyCount)}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "评论";
}

function formatLargeNumber(value: number) {
  if (value >= 10000) {
    return `${Number((value / 10000).toFixed(1))}万`;
  }

  return String(value);
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-[#eadfd7] bg-[#fffaf7] px-8 py-6">
      <h2 className="text-2xl italic text-[#1f2328] [font-family:var(--font-cormorant)]">
        {title}
      </h2>
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl p-2 text-[#9b8d84] transition-colors hover:bg-[#fffaf7] hover:text-[#1f2328]"
        aria-label="关闭弹窗"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

function InlineFilterGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (nextValue: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={cn(
            "h-8 rounded-lg border px-3 text-[10px] uppercase tracking-[0.16em] transition-colors",
            value === option
              ? "border-[#f2556b]/40 bg-[#fff0ef] text-[#f2556b]"
              : "border-[#eadfd7] bg-[#fffaf7] text-[#7f7067] hover:bg-[#fffaf7] hover:text-[#4f433d]",
          )}
        >
          {formatOptionLabel(option)}
        </button>
      ))}
    </div>
  );
}

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  suffix = "",
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (nextValue: T) => void;
  suffix?: string;
}) {
  return (
    <div>
      <label className="mb-3 block text-[10px] uppercase tracking-[0.22em] text-[#7f7067]">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "rounded-lg border px-4 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors",
              value === option
                ? "border-[#f2556b]/40 bg-[#fff0ef] text-[#f2556b]"
                : "border-[#eadfd7] bg-[#fffaf7] text-[#6f625d] hover:bg-[#fff0ef] hover:text-[#1f2328]",
            )}
          >
            {formatOptionLabel(option)}
            {option === "all" ? "" : suffix}
          </button>
        ))}
      </div>
    </div>
  );
}

function formatOptionLabel(option: string) {
  if (option === "all") return "全量";
  if (option in materialTypeLabels) return materialTypeLabels[option as MaterialType];
  return option in platformLabels ? platformLabels[option as MaterialPlatform] : option;
}

function formatMaterialTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return materialTimeFormatter.format(date);
}
