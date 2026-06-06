import { MemberArticleTaskPage } from "@/components/member/member-workspace";

export default async function DashboardTodayArticleRoute({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;

  return <MemberArticleTaskPage taskId={taskId} backHref="/dashboard/today" />;
}
