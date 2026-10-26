import { findLesson, prerequisite } from "./catalogue";
import { findPlan } from "./plans";
import type { Role, Subscription } from "./types";

export function activeSubscription(
  subscription: Subscription | null,
  now = Date.now(),
) {
  return (
    !!subscription &&
    subscription.status === "active" &&
    subscription.expires_at > now &&
    !!findPlan(subscription.plan)
  );
}
export function hasClub(subscription: Subscription | null, now = Date.now()) {
  return (
    activeSubscription(subscription, now) &&
    !!findPlan(subscription!.plan)?.club
  );
}
export function lessonAccess(
  id: string,
  subscription: Subscription | null,
  completed: Set<string>,
  role: Role = "student",
  now = Date.now(),
): string | null {
  const lesson = findLesson(id);
  if (!lesson) return "Cette leçon est introuvable.";
  if (role === "admin" || role === "editor") return null;
  if (!activeSubscription(subscription, now))
    return "Votre accès est inactif ou a expiré. Votre progression est conservée.";
  if (subscription?.plan === "essai" && lesson.moduleId !== 1)
    return "L’offre Découverte donne accès aux six leçons du module 01.";
  const required = prerequisite(lesson);
  if (!completed.has(id) && required && !completed.has(required))
    return "Validez le quiz de la leçon précédente pour continuer.";
  return null;
}
export const canEdit = (role: Role) => role === "editor" || role === "admin";
export function isDemo() {
  return (
    process.env.DEMO_MODE === "true" ||
    (process.env.DEMO_MODE === undefined &&
      process.env.NODE_ENV !== "production")
  );
}
