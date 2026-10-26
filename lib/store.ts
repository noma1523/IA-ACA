import { randomUUID } from "node:crypto";
import { db } from "./database";
import { lessonAccess } from "./policy";
import type {
  Content,
  FeedPost,
  Post,
  Progress,
  Question,
  Subscription,
  User,
} from "./types";

export const subscriptionFor = (userId: string) =>
  (db().prepare("SELECT * FROM subscriptions WHERE user_id = ?").get(userId) as
    Subscription | undefined) ?? null;
export const progressFor = (userId: string) =>
  db()
    .prepare(
      "SELECT lesson_id,best_score,completed_at FROM progress WHERE user_id = ?",
    )
    .all(userId) as Progress[];
export const completedFor = (userId: string) =>
  new Set(
    progressFor(userId)
      .filter((row) => row.completed_at !== null)
      .map((row) => row.lesson_id),
  );
export const contentFor = (id: string) => {
  const row = db()
    .prepare("SELECT * FROM lesson_content WHERE lesson_id = ?")
    .get(id) as Content | undefined;
  return row ? { ...row } : undefined;
};
export const accessFor = (user: User, id: string) =>
  lessonAccess(id, subscriptionFor(user.id), completedFor(user.id), user.role);
export const threshold = () =>
  Number(
    (
      db()
        .prepare("SELECT value FROM settings WHERE key = 'quiz_threshold'")
        .get() as { value: string }
    ).value,
  );
export const questionsFor = (content: Content) =>
  JSON.parse(content.quiz_json) as Question[];
export function publicContent(content: Content) {
  return {
    lesson_id: content.lesson_id,
    body: content.published ? content.body : "",
    video_url: content.published ? content.video_url : "",
    published: !!content.published,
    questions: content.published
      ? questionsFor(content).map(({ question, options }) => ({
          question,
          options,
        }))
      : [],
  };
}
export function gradeQuiz(userId: string, id: string, answers: number[]) {
  const quiz = questionsFor(contentFor(id)!);
  const score = quiz.filter(
    (question, index) => question.correctIndex === answers[index],
  ).length;
  const passed = score >= threshold();
  const now = Date.now();
  db().exec("BEGIN IMMEDIATE");
  try {
    db()
      .prepare("INSERT INTO attempts VALUES (?, ?, ?, ?, ?)")
      .run(randomUUID(), userId, id, score, now);
    db()
      .prepare(
        `INSERT INTO progress (user_id,lesson_id,best_score,completed_at) VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id,lesson_id) DO UPDATE SET best_score = MAX(best_score,excluded.best_score), completed_at = COALESCE(completed_at,excluded.completed_at)`,
      )
      .run(userId, id, score, passed ? now : null);
    db().exec("COMMIT");
  } catch (error) {
    db().exec("ROLLBACK");
    throw error;
  }
  return {
    score,
    passed,
    threshold: threshold(),
    correction: quiz.map((question) => ({
      question: question.question,
      correctAnswer: question.options[question.correctIndex],
    })),
  };
}
export function feedFor(userId: string): FeedPost[] {
  const posts = db()
    .prepare(
      "SELECT * FROM posts WHERE status = 'published' ORDER BY created_at DESC",
    )
    .all() as Post[];
  return posts.map((post) => ({
    ...post,
    bookmarked: !!db()
      .prepare("SELECT 1 FROM bookmarks WHERE user_id = ? AND post_id = ?")
      .get(userId, post.id),
    comments: db()
      .prepare(
        "SELECT c.id,u.name,c.body,c.created_at FROM comments c JOIN users u ON u.id=c.user_id WHERE post_id = ? ORDER BY c.created_at",
      )
      .all(post.id)
      .map((row) => ({ ...row })) as FeedPost["comments"],
  }));
}
