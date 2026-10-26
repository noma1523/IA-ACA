import { NextResponse } from "next/server";
import { ApiError, apiError, apiUser } from "@/lib/http";
import { accessFor, contentFor, publicContent } from "@/lib/store";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await apiUser();
    const { id } = await params;
    const content = contentFor(id);
    if (!content) throw new ApiError("Leçon introuvable.", 404);
    const reason = accessFor(user, id);
    if (reason) throw new ApiError(reason, 403);
    return NextResponse.json(publicContent(content), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return apiError(error);
  }
}
