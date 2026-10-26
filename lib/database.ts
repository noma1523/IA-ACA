import { DatabaseSync } from "node:sqlite";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { lessons } from "./catalogue";
import { firstLesson } from "../data/first-lesson";
import firstQuiz from "../data/first-quiz.json";

const globalDatabase = globalThis as typeof globalThis & {
  academyDb?: DatabaseSync;
  academyDbPath?: string;
};

export function db() {
  // La base est un fichier d’exécution, pas un fichier à inclure dans le build.
  const path = resolve(
    /* turbopackIgnore: true */ process.env.DATABASE_PATH ||
      ".data/academie.sqlite",
  );
  if (globalDatabase.academyDb && globalDatabase.academyDbPath === path)
    return globalDatabase.academyDb;
  mkdirSync(dirname(path), { recursive: true });
  const connection = new DatabaseSync(path);
  connection.exec(
    "PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;",
  );
  connection.exec(readFileSync(resolve("migrations/001_initial.sql"), "utf8"));
  const initialized = connection
    .prepare("SELECT 1 FROM schema_migrations WHERE version = 1")
    .get();
  connection.exec("BEGIN IMMEDIATE");
  try {
    const insert = connection.prepare(
      "INSERT OR IGNORE INTO lesson_content (lesson_id, body, quiz_json, published, updated_at) VALUES (?, ?, ?, ?, ?)",
    );
    for (const lesson of lessons) {
      insert.run(
        lesson.id,
        lesson.number === 1 ? firstLesson : "",
        lesson.number === 1 ? JSON.stringify(firstQuiz) : "[]",
        lesson.number === 1 ? 1 : 0,
        Date.now(),
      );
    }
    if (!initialized)
      connection
        .prepare(
          "INSERT OR IGNORE INTO posts (id,title,body,category,status,created_at) VALUES (?,?,?,?,?,?)",
        )
        .run(
          "welcome",
          "Bienvenue dans le Club IA",
          "Cet espace de démonstration vous permet d’échanger avec les autres membres. Partagez vos questions et vos retours d’expérience. Les publications pédagogiques seront préparées et vérifiées par l’équipe.",
          "Conseils",
          "published",
          Date.now(),
        );
    connection
      .prepare("INSERT OR IGNORE INTO schema_migrations VALUES (1, ?)")
      .run(Date.now());
    connection.exec("COMMIT");
  } catch (error) {
    connection.exec("ROLLBACK");
    connection.close();
    throw error;
  }
  globalDatabase.academyDb = connection;
  globalDatabase.academyDbPath = path;
  return connection;
}
