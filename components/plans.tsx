"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { plans, euro } from "@/lib/plans";
import { post } from "@/lib/client";
import { Icon } from "./icon";
export function Plans({
  loggedIn,
  demo,
}: {
  loggedIn: boolean;
  demo: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(""),
    [error, setError] = useState("");
  async function activate(id: string) {
    if (!loggedIn) {
      router.push("/inscription");
      return;
    }
    setPending(id);
    setError("");
    try {
      await post("/api/demo", { plan: id });
      router.push("/espace");
      router.refresh();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setPending("");
    }
  }
  return (
    <>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="plans-grid">
        {plans.map((plan) => (
          <article
            className={`plan-card ${plan.id === "mensuel" ? "featured" : ""}`}
            key={plan.id}
          >
            {plan.id === "mensuel" && (
              <div className="plan-ribbon">Pour apprendre et échanger</div>
            )}
            <span className="plan-icon">
              <Icon
                name={
                  plan.club ? "users" : plan.id === "essai" ? "spark" : "book"
                }
                size={23}
              />
            </span>
            <h2>{plan.name}</h2>
            <p className="muted plan-description">{plan.description}</p>
            <div className="plan-price">
              <strong>{euro(plan.price)}</strong>
              <span>/ {plan.duration}</span>
            </div>
            <div className="plan-divider" />
            <ul className="check-list">
              <li>
                <Icon name="check" />
                {plan.id === "essai"
                  ? "Module 01 · 6 leçons"
                  : "22 modules · 132 leçons"}
              </li>
              <li>
                <Icon name="check" />
                Cours, vidéos disponibles et quiz
              </li>
              <li>
                <Icon name="check" />
                Progression conservée
              </li>
              <li className={!plan.club ? "muted" : ""}>
                <Icon name={plan.club ? "check" : "lock"} />
                {plan.club ? "Club IA inclus" : "Sans Club IA"}
              </li>
            </ul>
            <button
              disabled={!!pending || !demo}
              className={`button full ${plan.id === "mensuel" ? "primary" : "secondary"}`}
              onClick={() => activate(plan.id)}
            >
              {pending === plan.id
                ? "Activation…"
                : demo
                  ? "Essayer cette formule"
                  : "Paiement bientôt disponible"}
              <Icon name="arrow" size={16} />
            </button>
            <small className="muted plan-renewal">
              {plan.club && plan.id !== "mensuel"
                ? "Prolongation avec Club : tarif à définir."
                : plan.renewal
                  ? `Prolongation indicative : ${euro(plan.renewal)}/mois, sur demande.`
                  : "Accès de 7 jours, sans renouvellement automatique."}
            </small>
          </article>
        ))}
      </div>
    </>
  );
}
