import { MemberVideoTaskPage } from "@/components/member/member-workspace";

export default async function DashboardTodayVideoRoute({
  params,
  searchParams,
}: {
  params: Promise<{ taskId: string }>;
  searchParams: Promise<{ jobId?: string }>;
}) {
  const { taskId } = await params;
  const { jobId } = await searchParams;

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-[#fbfaf7]">
      <MemberVideoTaskPage taskId={taskId} jobId={jobId ?? null} backHref="/dashboard/today" />
    </div>
  );
}
