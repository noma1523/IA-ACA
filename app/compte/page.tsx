import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { completedFor, subscriptionFor } from "@/lib/store";
import { activeSubscription, isDemo } from "@/lib/policy";
import { dateLabel, findPlan } from "@/lib/plans";
import { Intro, Notice } from "@/components/ui";
import { ExpireDemo } from "@/components/account-actions";
export const metadata = { title: "Mon compte" };
export default async function Account() {
  const user = await requireUser(),
    subscription = subscriptionFor(user.id);
  return (
    <>
      <Intro
        eyebrow="MON COMPTE"
        title="Votre espace, vos repères."
        text="Retrouvez votre profil, votre formule et votre progression."
      />
      <div className="two-columns">
        <section className="panel info-panel">
          <h2>Mon profil</h2>
          <dl className="definition-list">
            <div>
              <dt>Nom</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Rôle</dt>
              <dd>
                {
                  {
                    student: "Élève",
                    editor: "Éditeur",
                    admin: "Administrateur",
                  }[user.role]
                }
              </dd>
            </div>
            <div>
              <dt>Leçons validées</dt>
              <dd>{completedFor(user.id).size} / 132</dd>
            </div>
          </dl>
        </section>
        <section className="panel info-panel">
          <div className="row between">
            <h2>Ma formule</h2>
            <span
              className={`badge ${activeSubscription(subscription) ? "green" : ""}`}
            >
              {activeSubscription(subscription) ? "Active" : "Inactive"}
            </span>
          </div>
          <dl className="definition-list">
            <div>
              <dt>Formule</dt>
              <dd>
                {subscription
                  ? findPlan(subscription.plan)?.name
                  : "Aucune formule"}
              </dd>
            </div>
            <div>
              <dt>Échéance</dt>
              <dd>{subscription ? dateLabel(subscription.expires_at) : "—"}</dd>
            </div>
            <div>
              <dt>Renouvellement automatique</dt>
              <dd>Aucun</dd>
            </div>
          </dl>
          <div className="button-row">
            <Link className="button primary" href="/offres">
              Voir les formules
            </Link>
            {isDemo() && subscription && <ExpireDemo />}
          </div>
        </section>
      </div>
      <Notice title="Vos résultats sont conservés après expiration.">
        Vous pourrez reprendre votre parcours après activation d’une nouvelle
        formule. Le tarif de prolongation avec Club IA reste à définir ; aucune
        prolongation automatique n’est appliquée.
      </Notice>
    </>
  );
}
