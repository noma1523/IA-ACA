import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { db } from "../lib/database";
import {
  createSession,
  digest,
  hashPassword,
  userForToken,
  verifyPassword,
} from "../lib/security";
import {
  completedFor,
  contentFor,
  gradeQuiz,
  publicContent,
  subscriptionFor,
  accessFor,
} from "../lib/store";
import type { User } from "../lib/types";
const directory = mkdtempSync(join(tmpdir(), "academie-unit-"));
process.env.DATABASE_PATH = join(directory, "test.sqlite");
test.after(() => {
  db().close();
  rmSync(directory, { recursive: true, force: true });
});
const alice: User = {
  id: "alice",
  email: "alice@example.test",
  name: "Alice",
  role: "student",
  created_at: Date.now(),
};
test("la migration prépare 132 emplacements sans faux contenus", () => {
  assert.equal(
    (
      db().prepare("SELECT COUNT(*) AS count FROM lesson_content").get() as {
        count: number;
      }
    ).count,
    132,
  );
  assert.ok(contentFor("l001")!.body.includes("intelligence artificielle"));
  assert.equal(contentFor("l002")!.body, "");
  assert.deepEqual(publicContent(contentFor("l002")!).questions, []);
});
test("les mots de passe sont salés et les sessions sont opaques et révocables", async () => {
  const password = "A strong local test password";
  const hash = await hashPassword(password);
  assert.ok(!hash.includes(password));
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword("incorrect password", hash), false);
  assert.equal(await verifyPassword(password), false);
  assert.notEqual(hash, await hashPassword(password));
  db()
    .prepare("INSERT INTO users VALUES (?,?,?,?,?,?)")
    .run(alice.id, alice.email, alice.name, hash, alice.role, alice.created_at);
  const token = createSession(alice.id);
  assert.equal(userForToken(token)?.id, alice.id);
  assert.equal(Object.getPrototypeOf(userForToken(token)), Object.prototype);
  const stored = db().prepare("SELECT token_hash FROM sessions").get() as {
    token_hash: string;
  };
  assert.notEqual(stored.token_hash, token);
  assert.equal(stored.token_hash, digest(token));
  db().prepare("DELETE FROM sessions WHERE token_hash=?").run(digest(token));
  assert.equal(userForToken(token), null);
});
test("le questionnaire public ne révèle pas les bonnes réponses", () => {
  const content = publicContent(contentFor("l001")!);
  assert.equal(content.questions.length, 10);
  assert.equal(JSON.stringify(content).includes("correctIndex"), false);
});
test("le serveur note les réponses et conserve le meilleur résultat après expiration", () => {
  const failed = gradeQuiz("alice", "l001", Array(10).fill(3));
  assert.equal(failed.passed, false);
  assert.equal(completedFor("alice").size, 0);
  const passed = gradeQuiz("alice", "l001", [0, 1, 0, 0, 1, 1, 0, 0, 0, 1]);
  assert.equal(passed.score, 10);
  assert.equal(passed.passed, true);
  gradeQuiz("alice", "l001", Array(10).fill(3));
  assert.equal(completedFor("alice").size, 1);
  db()
    .prepare("INSERT INTO subscriptions VALUES (?,?,?,?)")
    .run("alice", "mensuel", Date.now() - 1, "active");
  assert.equal(subscriptionFor("alice")?.plan, "mensuel");
  assert.ok(accessFor(alice, "l001"));
  assert.equal(completedFor("alice").size, 1);
  assert.equal(completedFor("bob").size, 0);
  assert.equal(
    (
      db()
        .prepare("SELECT best_score FROM progress WHERE user_id='alice'")
        .get() as { best_score: number }
    ).best_score,
    10,
  );
});
