import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { userForToken } from "./security";

export const sessionCookie = "academie_session";
export async function currentUser() {
  return userForToken((await cookies()).get(sessionCookie)?.value);
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/connexion");
  return user;
}
