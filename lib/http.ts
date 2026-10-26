import { NextResponse } from "next/server";
import { currentUser } from "./auth";
import { canEdit } from "./policy";

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function guardOrigin(request: Request) {
  const origin = request.headers.get("origin");
  try {
    if (
      !origin ||
      new URL(origin).host !== request.headers.get("host") ||
      !["http:", "https:"].includes(new URL(origin).protocol)
    )
      throw new Error();
  } catch {
    throw new ApiError("Origine de la requête refusée.", 403);
  }
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new ApiError("Format de requête invalide.", 415);
  const length = Number(request.headers.get("content-length") || "0");
  if (length > 100_000) throw new ApiError("Requête trop volumineuse.", 413);
}
export async function jsonBody(request: Request) {
  guardOrigin(request);
  const text = await request.text();
  if (text.length > 100_000)
    throw new ApiError("Requête trop volumineuse.", 413);
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new Error();
    return data as Record<string, unknown>;
  } catch {
    throw new ApiError("Données JSON invalides.");
  }
}
export async function apiUser(editor = false) {
  const user = await currentUser();
  if (!user) throw new ApiError("Connectez-vous pour continuer.", 401);
  if (editor && !canEdit(user.role))
    throw new ApiError("Accès réservé à l’équipe éditoriale.", 403);
  return user;
}
export function apiError(error: unknown) {
  if (error instanceof ApiError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  console.error(
    "API failure:",
    error instanceof Error ? error.message : "Unknown error",
  );
  return NextResponse.json(
    { error: "Une erreur est survenue. Réessayez dans un instant." },
    { status: 500 },
  );
}
export const textValue = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
export function httpsUrl(value: unknown) {
  const text = textValue(value, 2000);
  if (!text) return "";
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" || url.username || url.password)
      throw new Error();
    return url.toString();
  } catch {
    throw new ApiError("Utilisez une adresse HTTPS valide, sans identifiants.");
  }
}
