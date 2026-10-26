import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { ApiError, apiError, apiUser, jsonBody, textValue } from "@/lib/http";
import { hasClub } from "@/lib/policy";
import { feedFor, subscriptionFor } from "@/lib/store";
import { db } from "@/lib/database";
import { allowRequest } from "@/lib/security";
async function member() {
  const user = await apiUser();
  if (!hasClub(subscriptionFor(user.id)))
    throw new ApiError("Une offre active avec Club IA est nécessaire.", 403);
  return user;
}
export async function GET() {
  try {
    const user = await member();
    return NextResponse.json(feedFor(user.id), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request) {
  try {
    const data = await jsonBody(request);
    const user = await member();
    const id = textValue(data.postId, 80);
    if (
      !db()
        .prepare("SELECT id FROM posts WHERE id=? AND status='published'")
        .get(id)
    )
      throw new ApiError("Publication introuvable.", 404);
    if (!allowRequest("club:" + user.id, 30, 60_000))
      throw new ApiError("Trop de demandes. Patientez une minute.", 429);
    if (data.action === "comment") {
      const body = textValue(data.body, 1000);
      if (!body) throw new ApiError("Votre commentaire est vide.");
      db()
        .prepare("INSERT INTO comments VALUES (?,?,?,?,?)")
        .run(randomUUID(), id, user.id, body, Date.now());
    } else if (data.action === "bookmark") {
      const existing = db()
        .prepare("SELECT 1 FROM bookmarks WHERE user_id=? AND post_id=?")
        .get(user.id, id);
      if (existing)
        db()
          .prepare("DELETE FROM bookmarks WHERE user_id=? AND post_id=?")
          .run(user.id, id);
      else db().prepare("INSERT INTO bookmarks VALUES (?,?)").run(user.id, id);
    } else if (data.action === "report") {
      db()
        .prepare("INSERT OR IGNORE INTO reports VALUES (?,?,?)")
        .run(user.id, id, Date.now());
    } else throw new ApiError("Action inconnue.");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
