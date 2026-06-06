import { MemberArticleTaskPage } from "@/components/member/member-workspace";

export default async function DashboardTodayArticleRoute({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-[#fbfaf7]">
      <MemberArticleTaskPage taskId={taskId} backHref="/dashboard/today" enableArticleRewrite />
    </div>
  );
}
