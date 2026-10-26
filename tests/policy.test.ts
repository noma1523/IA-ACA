import test from "node:test";
import assert from "node:assert/strict";
import {
  lessons,
  modules,
  prerequisite,
  nextLesson,
  mandatoryLessons,
} from "../lib/catalogue";
import { lessonAccess, hasClub, activeSubscription } from "../lib/policy";
import { expiresAt, plans } from "../lib/plans";
import type { Subscription } from "../lib/types";

const now = Date.UTC(2026, 0, 31, 12);
const subscription = (plan = "mensuel", expiry = now + 1000): Subscription => ({
  user_id: "alice",
  plan,
  expires_at: expiry,
  status: "active",
});
test("le catalogue conserve les 22 modules, 132 titres et leurs positions", () => {
  assert.equal(modules.length, 22);
  assert.equal(lessons.length, 132);
  assert.equal(mandatoryLessons.length, 126);
  assert.equal(lessons[0].title, "Définition et grandes familles");
  assert.equal(lessons[131].title, "Préparer une croissance responsable");
  assert.deepEqual(
    modules.map((module) => module.lessons.length),
    [6, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6, 6, 7, 6, 6, 6, 6, 6, 6, 6, 5, 7],
  );
  assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, 132);
  lessons.forEach((lesson, index) => assert.equal(lesson.number, index + 1));
});
test("un abonnement expiré est refusé à l’instant exact de son échéance", () => {
  assert.equal(activeSubscription(subscription("mensuel", now), now), false);
  assert.equal(hasClub(subscription("mensuel", now), now), false);
  assert.match(
    lessonAccess(
      "l001",
      subscription("mensuel", now),
      new Set(["l001"]),
      "student",
      now,
    )!,
    /expiré/,
  );
});
test("le module 02 facultatif ne bloque jamais le module 03", () => {
  const completed = new Set(["l001", "l002", "l003", "l004", "l005", "l006"]);
  assert.equal(prerequisite(lessons[12]), "l006");
  assert.equal(nextLesson(lessons[5])?.id, "l013");
  assert.equal(
    lessonAccess("l013", subscription(), completed, "student", now),
    null,
  );
  assert.equal(
    lessonAccess("l007", subscription(), completed, "student", now),
    null,
  );
  assert.match(
    lessonAccess("l014", subscription(), completed, "student", now)!,
    /précédente/,
  );
});
test("l’essai est limité au module 01 et les trois formules Club sont exactes", () => {
  assert.equal(
    lessonAccess("l001", subscription("essai"), new Set(), "student", now),
    null,
  );
  assert.match(
    lessonAccess(
      "l013",
      subscription("essai"),
      new Set(["l006"]),
      "student",
      now,
    )!,
    /Découverte/,
  );
  for (const plan of plans)
    assert.equal(
      hasClub(subscription(plan.id), now),
      ["mensuel", "flexible_club", "integrale_club"].includes(plan.id),
    );
});
test("les mois calendaires sont bornés au dernier jour du mois", () => {
  assert.equal(expiresAt("mensuel", now), Date.UTC(2026, 1, 28, 12));
  assert.equal(expiresAt("essai", now), now + 7 * 86400000);
  assert.throws(() => expiresAt("inconnue"));
});
test("les inconnus et les abonnements annulés restent refusés", () => {
  assert.ok(lessonAccess("missing", subscription(), new Set(), "admin", now));
  assert.equal(
    activeSubscription({ ...subscription(), status: "cancelled" }, now),
    false,
  );
  assert.ok(lessonAccess("l001", null, new Set(), "student", now));
});
