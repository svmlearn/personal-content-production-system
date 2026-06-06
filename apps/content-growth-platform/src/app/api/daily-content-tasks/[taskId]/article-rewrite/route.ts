import { getAuthenticatedUser } from "@/lib/auth/current-user";
import { reviseDailyArticleTaskForUser } from "@/server/api/content-generation-service";
import { handleApiError } from "@/server/api/errors";
import { reviseDailyArticleTaskSchema } from "@/server/api/schemas";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ taskId: string }> },
) {
  try {
    const user = await getAuthenticatedUser();
    const { taskId } = await context.params;
    const payload = reviseDailyArticleTaskSchema.parse(await request.json());
    const result = await reviseDailyArticleTaskForUser({
      userId: user.id,
      dailyTaskId: taskId,
      revisionInstruction: payload.revisionInstruction,
      toneStyle: payload.toneStyle,
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
