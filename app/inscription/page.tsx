import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Créer mon compte" };
export default async function Inscription() {
  if (await currentUser()) redirect("/espace");
  return <AuthForm register />;
}
