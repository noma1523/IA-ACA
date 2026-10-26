import { NextResponse } from "next/server";
import { ApiError, apiError, apiUser, jsonBody } from "@/lib/http";
import { accessFor, contentFor, gradeQuiz, questionsFor } from "@/lib/store";
import { allowRequest } from "@/lib/security";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const data = await jsonBody(request);
    const user = await apiUser();
    const { id } = await params;
    const content = contentFor(id);
    if (!content) throw new ApiError("Leçon introuvable.", 404);
    const reason = accessFor(user, id);
    if (reason) throw new ApiError(reason, 403);
    if (!content.published || questionsFor(content).length !== 10)
      throw new ApiError("Le quiz de cette leçon est en préparation.", 409);
    if (
      !Array.isArray(data.answers) ||
      data.answers.length !== 10 ||
      data.answers.some(
        (answer) =>
          !Number.isInteger(answer) || Number(answer) < 0 || Number(answer) > 3,
      )
    )
      throw new ApiError("Répondez aux dix questions avant de valider.");
    if (!allowRequest("quiz:" + user.id, 30, 60_000))
      throw new ApiError(
        "Patientez une minute avant une nouvelle tentative.",
        429,
      );
    return NextResponse.json(gradeQuiz(user.id, id, data.answers as number[]));
  } catch (error) {
    return apiError(error);
  }
}
