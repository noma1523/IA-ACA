import { requireUser } from "@/lib/auth";
import { completedFor } from "@/lib/store";
import { modules, pad } from "@/lib/catalogue";
import { Intro, Notice } from "@/components/ui";
import { Icon } from "@/components/icon";
export const metadata = { title: "Mes attestations" };
export default async function Attestations() {
  const user = await requireUser(),
    complete = completedFor(user.id);
  return (
    <>
      <Intro
        eyebrow="MES ATTESTATIONS"
        title="Chaque étape compte."
        text="Retrouvez les modules que vous avez validés, même lorsque votre accès a expiré."
      />
      <Notice title="Les attestations ne sont pas encore délivrées.">
        Les critères de délivrance et les mentions de l’attestation Académie IA
        restent à valider. Cette formation ne revendique aucune accréditation
        officielle.
      </Notice>
      <div className="panel milestone-list">
        {modules.map((module) => {
          const done = module.lessons.every((lesson) =>
            complete.has(lesson.id),
          );
          return (
            <div key={module.id}>
              <span className="module-emoji">{module.emoji}</span>
              <span>
                <small className="muted">MODULE {pad(module.id)}</small>
                <strong>{module.title}</strong>
              </span>
              <span className={`badge ${done ? "green" : ""}`}>
                <Icon name={done ? "check" : "lock"} size={14} />
                {done ? "Module validé" : "En cours"}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
