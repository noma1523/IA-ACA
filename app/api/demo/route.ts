import { NextResponse } from "next/server";
import { ApiError, apiError, apiUser, jsonBody } from "@/lib/http";
import { isDemo } from "@/lib/policy";
import { expiresAt, findPlan } from "@/lib/plans";
import { db } from "@/lib/database";
export async function POST(request: Request) {
  try {
    const data = await jsonBody(request);
    const user = await apiUser();
    if (!isDemo())
      throw new ApiError(
        "Les activations de démonstration sont désactivées.",
        403,
      );
    if (data.action === "expire") {
      db()
        .prepare("UPDATE subscriptions SET expires_at = ? WHERE user_id = ?")
        .run(Date.now() - 1, user.id);
    } else {
      const plan = typeof data.plan === "string" ? findPlan(data.plan) : null;
      if (!plan) throw new ApiError("Choisissez une offre valide.");
      db()
        .prepare(
          "INSERT INTO subscriptions (user_id,plan,expires_at,status) VALUES (?,?,?,'active') ON CONFLICT(user_id) DO UPDATE SET plan=excluded.plan,expires_at=excluded.expires_at,status='active'",
        )
        .run(user.id, plan.id, expiresAt(plan.id));
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
