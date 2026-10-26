import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { sessionCookie } from "@/lib/auth";
import {
  allowRequest,
  createSession,
  hashPassword,
  verifyPassword,
  digest,
} from "@/lib/security";
import { ApiError, apiError, jsonBody, textValue } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const data = await jsonBody(request);
    const email = textValue(data.email, 254).toLowerCase();
    const password = typeof data.password === "string" ? data.password : "";
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length < 10 ||
      password.length > 128
    )
      throw new ApiError(
        "Indiquez un email valide et un mot de passe de 10 à 128 caractères.",
      );
    if (
      !allowRequest("auth:global", 100) ||
      !allowRequest("auth:" + digest(email), 15)
    )
      throw new ApiError("Trop de tentatives. Réessayez dans 15 minutes.", 429);
    let userId: string;
    if (data.action === "register") {
      const name = textValue(data.name, 80);
      if (name.length < 2)
        throw new ApiError("Indiquez votre prénom et votre nom.");
      if (db().prepare("SELECT id FROM users WHERE email = ?").get(email))
        throw new ApiError(
          "Inscription impossible avec cette adresse. Essayez de vous connecter.",
          409,
        );
      userId = randomUUID();
      db()
        .prepare(
          "INSERT INTO users (id,email,name,password_hash,created_at) VALUES (?,?,?,?,?)",
        )
        .run(userId, email, name, await hashPassword(password), Date.now());
    } else if (data.action === "login") {
      const user = db()
        .prepare("SELECT id,password_hash FROM users WHERE email = ?")
        .get(email) as { id: string; password_hash: string } | undefined;
      if (!(await verifyPassword(password, user?.password_hash)) || !user)
        throw new ApiError("Email ou mot de passe incorrect.", 401);
      userId = user.id;
    } else throw new ApiError("Action inconnue.");
    const previous = (await cookies()).get(sessionCookie)?.value;
    if (previous)
      db()
        .prepare("DELETE FROM sessions WHERE token_hash = ?")
        .run(digest(previous));
    (await cookies()).set(sessionCookie, createSession(userId), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 86400,
      secure:
        process.env.COOKIE_SECURE === "true" ||
        (process.env.COOKIE_SECURE !== "false" &&
          process.env.NODE_ENV === "production" &&
          process.env.DEMO_MODE !== "true"),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
