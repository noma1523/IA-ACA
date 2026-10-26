import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { db } from "./database";
import type { User } from "./types";

export const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const derive = (password: string, salt: string) =>
  new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${(await derive(password, salt)).toString("hex")}`;
}
export async function verifyPassword(password: string, stored?: string) {
  const [salt, key] = (stored || `${"0".repeat(32)}:${"0".repeat(128)}`).split(
    ":",
  );
  if (!/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(key))
    return false;
  const expected = Buffer.from(key, "hex");
  return timingSafeEqual(await derive(password, salt), expected) && !!stored;
}
export function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  db().prepare("DELETE FROM sessions WHERE expires_at <= ?").run(Date.now());
  db()
    .prepare("INSERT INTO sessions VALUES (?, ?, ?)")
    .run(digest(token), userId, Date.now() + 7 * 86_400_000);
  return token;
}
export function userForToken(token?: string): User | null {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const row = db()
    .prepare(
      "SELECT u.id,u.name,u.email,u.role,u.created_at FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash = ? AND s.expires_at > ?",
    )
    .get(digest(token), Date.now()) as User | undefined;
  return row ? { ...row } : null;
}
export function allowRequest(key: string, limit = 15, period = 900_000) {
  const now = Date.now();
  db().prepare("DELETE FROM rate_limits WHERE expires_at <= ?").run(now);
  db()
    .prepare(
      "INSERT INTO rate_limits VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1",
    )
    .run(key, now + period);
  const row = db()
    .prepare("SELECT count FROM rate_limits WHERE key = ?")
    .get(key) as { count: number };
  return row.count <= limit;
}
