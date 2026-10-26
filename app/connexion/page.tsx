import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Connexion" };
export default async function Connexion() {
  if (await currentUser()) redirect("/espace");
  return <AuthForm register={false} />;
}
