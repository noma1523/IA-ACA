import { currentUser } from "@/lib/auth";
import { isDemo } from "@/lib/policy";
import { Plans } from "@/components/plans";
import { Intro, Notice } from "@/components/ui";
export const metadata = { title: "Les formules" };
export default async function Offres() {
  const demo = isDemo();
  return (
    <>
      <Intro
        eyebrow="LES FORMULES"
        title="Votre rythme. Votre formule."
        text="Commencez petit ou prenez le temps d’explorer. Le même parcours, des durées adaptées à vos envies."
      />
      <Notice
        title={
          demo
            ? "Des offres à essayer, sans sortir votre carte."
            : "Les souscriptions ne sont pas encore ouvertes."
        }
      >
        {demo
          ? "Chaque bouton active un accès de démonstration côté serveur. Aucun débit, aucun renouvellement automatique."
          : "La connexion au prestataire de paiement reste à intégrer avant commercialisation."}
      </Notice>
      <Plans loggedIn={!!(await currentUser())} demo={demo} />
      <div className="panel info-panel">
        <h2>Vos acquis restent avec vous.</h2>
        <p>
          À expiration, les cours et le Club IA sont suspendus. Vos résultats et
          votre progression restent consultables dans votre compte.
        </p>
        <p className="muted small">
          Les vidéos et les cours encore en préparation sont clairement
          indiqués. Cette version de développement ne constitue pas une offre
          commerciale active.
        </p>
      </div>
    </>
  );
}
