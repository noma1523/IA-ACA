import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  ApiError,
  apiError,
  apiUser,
  httpsUrl,
  jsonBody,
  textValue,
} from "@/lib/http";
import { contentFor } from "@/lib/store";
import { findLesson } from "@/lib/catalogue";
import { db } from "@/lib/database";
import type { Question } from "@/lib/types";

export async function GET(request: Request) {
  try {
    await apiUser(true);
    const content = contentFor(
      new URL(request.url).searchParams.get("lesson") || "l001",
    );
    if (!content) throw new ApiError("Leçon introuvable.", 404);
    return NextResponse.json(content, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request) {
  try {
    const data = await jsonBody(request);
    const user = await apiUser(true);
    if (data.action === "lesson") {
      const id = textValue(data.lessonId, 20);
      if (!findLesson(id)) throw new ApiError("Leçon introuvable.", 404);
      const body = textValue(data.body, 40_000);
      const video = httpsUrl(data.videoUrl);
      const quiz = data.quiz;
      if (!Array.isArray(quiz) || (quiz.length !== 0 && quiz.length !== 10))
        throw new ApiError(
          "Le quiz doit être vide ou contenir exactement dix questions.",
        );
      if (
        quiz.some(
          (entry: Question) =>
            !entry ||
            typeof entry.question !== "string" ||
            !entry.question.trim() ||
            entry.question.length > 1000 ||
            !Array.isArray(entry.options) ||
            entry.options.length !== 4 ||
            entry.options.some(
              (option) =>
                typeof option !== "string" ||
                !option.trim() ||
                option.length > 1000,
            ) ||
            !Number.isInteger(entry.correctIndex) ||
            entry.correctIndex < 0 ||
            entry.correctIndex > 3,
        )
      )
        throw new ApiError(
          "Chaque question doit avoir quatre choix et une bonne réponse de 1 à 4.",
        );
      if (data.published === true && !body)
        throw new ApiError("Ajoutez le cours écrit avant publication.");
      db()
        .prepare(
          "UPDATE lesson_content SET body=?,video_url=?,quiz_json=?,published=?,updated_at=? WHERE lesson_id=?",
        )
        .run(
          body,
          video,
          JSON.stringify(quiz),
          data.published === true ? 1 : 0,
          Date.now(),
          id,
        );
    } else if (data.action === "post") {
      const title = textValue(data.title, 120),
        body = textValue(data.body, 5000);
      if (!title || !body) throw new ApiError("Indiquez un titre et un texte.");
      const category = textValue(data.category, 40);
      if (!["IA", "Business", "Outils", "Conseils"].includes(category))
        throw new ApiError("Catégorie invalide.");
      const source = httpsUrl(data.sourceUrl),
        status = data.published === true ? "published" : "draft";
      const id = textValue(data.postId, 80);
      if (id) {
        if (!db().prepare("SELECT 1 FROM posts WHERE id=?").get(id))
          throw new ApiError("Publication introuvable.", 404);
        db()
          .prepare(
            "UPDATE posts SET title=?,body=?,category=?,source_url=?,status=? WHERE id=?",
          )
          .run(title, body, category, source, status, id);
      } else
        db()
          .prepare("INSERT INTO posts VALUES (?,?,?,?,?,?,?)")
          .run(randomUUID(), title, body, category, source, status, Date.now());
    } else if (data.action === "deletePost") {
      db()
        .prepare("DELETE FROM posts WHERE id=?")
        .run(textValue(data.postId, 80));
    } else if (data.action === "deleteComment") {
      db()
        .prepare("DELETE FROM comments WHERE id=?")
        .run(textValue(data.commentId, 80));
    } else if (data.action === "threshold") {
      if (user.role !== "admin")
        throw new ApiError("Action réservée à l’administrateur.", 403);
      if (
        !Number.isInteger(data.threshold) ||
        Number(data.threshold) < 1 ||
        Number(data.threshold) > 10
      )
        throw new ApiError("Le seuil doit être compris entre 1 et 10.");
      db()
        .prepare("UPDATE settings SET value=? WHERE key='quiz_threshold'")
        .run(String(data.threshold));
    } else throw new ApiError("Action inconnue.");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
