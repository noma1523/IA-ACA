import { db } from "../lib/database";
const result = db()
  .prepare("SELECT COUNT(*) AS count FROM lesson_content")
  .get() as { count: number };
console.log(
  `Base locale prête : ${result.count} leçons. Les contenus déjà édités sont conservés.`,
);
