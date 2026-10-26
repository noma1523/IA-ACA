import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookie } from "@/lib/auth";
import { db } from "@/lib/database";
import { digest } from "@/lib/security";
import { apiError, jsonBody } from "@/lib/http";
export async function POST(request: Request) {
  try {
    await jsonBody(request);
    const token = (await cookies()).get(sessionCookie)?.value;
    if (token)
      db()
        .prepare("DELETE FROM sessions WHERE token_hash = ?")
        .run(digest(token));
    (await cookies()).delete(sessionCookie);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
