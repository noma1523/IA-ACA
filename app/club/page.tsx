import { currentUser } from "@/lib/auth";
import { hasClub } from "@/lib/policy";
import { subscriptionFor, feedFor } from "@/lib/store";
import { ClubFeed } from "@/components/club-feed";
import { Intro, Locked, Notice } from "@/components/ui";
export const metadata = { title: "Le Club IA" };
export default async function Club() {
  const user = await currentUser(),
    eligible = user && hasClub(subscriptionFor(user.id));
  return (
    <>
      <Intro
        eyebrow="LE CLUB IA"
        title="Apprendre, c’est aussi échanger."
        text="Un espace pour partager vos découvertes, poser vos questions et garder un regard curieux sur l’IA."
      />
      {eligible ? (
        <>
          <Notice title="Bienvenue dans le Club de démonstration.">
            Les publications de départ sont des exemples. Vos commentaires et
            favoris sont enregistrés dans votre compte.
          </Notice>
          <ClubFeed posts={feedFor(user!.id)} />
        </>
      ) : (
        <Locked
          title="Un espace réservé aux membres du Club."
          text="Le Club est inclus dans les formules Mensuel, Flexible + Club et Intégrale + Club, pendant la durée de votre accès actif."
          loggedIn={!!user}
        />
      )}
    </>
  );
}
