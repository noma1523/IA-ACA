import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { completedFor, subscriptionFor } from "@/lib/store";
import { lessonAccess, activeSubscription } from "@/lib/policy";
import { lessons, mandatoryLessons, modules, pad } from "@/lib/catalogue";
import { Intro, Notice, ProgressBar } from "@/components/ui";
import { Icon } from "@/components/icon";
export const metadata = { title: "Mon tableau de bord" };
export default async function Espace() {
  const user = await requireUser(),
    completed = completedFor(user.id),
    subscription = subscriptionFor(user.id);
  const next =
    mandatoryLessons.find(
      (lesson) =>
        !completed.has(lesson.id) &&
        !lessonAccess(lesson.id, subscription, completed, user.role),
    ) || lessons[0];
  const mainDone = mandatoryLessons.filter((lesson) =>
    completed.has(lesson.id),
  ).length;
  const percent = Math.round((mainDone / mandatoryLessons.length) * 100);
  return (
    <>
      <Intro
        eyebrow="MON TABLEAU DE BORD"
        title={`Bonjour ${user.name.split(" ")[0]} 👋`}
        text="Une leçon, un déclic, un pas de plus. Votre parcours vous attend."
      />
      {!activeSubscription(subscription) && (
        <Notice title="Votre progression est bien conservée.">
          Choisissez une <Link href="/offres">formule de démonstration</Link>{" "}
          pour ouvrir vos cours.
        </Notice>
      )}
      <section className="continue-card">
        <div>
          <span className="badge pale">VOTRE PROCHAINE ÉTAPE</span>
          <h2>
            {completed.size === 132
              ? "Le parcours est terminé. Bravo !"
              : next.title}
          </h2>
          <p>
            Module {pad(next.moduleId)} · Leçon {pad(next.number)}
          </p>
          <Link href={`/cours/${next.id}`} className="button white">
            {completed.size === 132
              ? "Revoir le parcours"
              : "Reprendre mon parcours"}
            <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div
          className="progress-ring"
          style={{
            background: `conic-gradient(#fff ${percent * 3.6}deg, #ffffff22 0deg)`,
          }}
        >
          <div>
            <strong>{percent}%</strong>
            <small>du parcours principal</small>
          </div>
        </div>
      </section>
      <div className="dashboard-stats">
        <div className="panel">
          <span className="stat-icon">
            <Icon name="check" />
          </span>
          <strong data-testid="completed-count">
            {completed.size}
            <small> / 132</small>
          </strong>
          <p>leçons validées</p>
        </div>
        <div className="panel">
          <span className="stat-icon">
            <Icon name="trophy" />
          </span>
          <strong>
            {
              modules.filter((module) =>
                module.lessons.every((lesson) => completed.has(lesson.id)),
              ).length
            }
            <small> / 22</small>
          </strong>
          <p>modules terminés</p>
        </div>
        <div className="panel">
          <span className="stat-icon">
            <Icon name="chart" />
          </span>
          <strong>
            {mainDone}
            <small> / 126</small>
          </strong>
          <p>leçons du parcours principal</p>
        </div>
      </div>
      <div className="section-heading">
        <div>
          <h2>Votre parcours, en un coup d’œil.</h2>
          <p className="muted">
            Le module 02 est facultatif et ne bloque jamais le module 03.
          </p>
        </div>
        <Link href="/programme" className="inline-link">
          Explorer le programme <Icon name="arrow" size={17} />
        </Link>
      </div>
      <div className="dashboard-modules">
        {modules.map((module) => {
          const count = module.lessons.filter((lesson) =>
            completed.has(lesson.id),
          ).length;
          return (
            <Link
              href={`/cours/${module.lessons.find((lesson) => !completed.has(lesson.id))?.id || module.lessons[0].id}`}
              className="panel dashboard-module"
              key={module.id}
            >
              <div className="row between">
                <span className="module-emoji">{module.emoji}</span>
                <span className="muted small">
                  MODULE {pad(module.id)}{" "}
                  {module.optional ? "· FACULTATIF" : ""}
                </span>
              </div>
              <h3>{module.title}</h3>
              <ProgressBar
                value={(count / module.lessons.length) * 100}
                label={`Progression du module ${module.id}`}
              />
              <div className="row between">
                <small className="muted">
                  {count}/{module.lessons.length} leçons validées
                </small>
                <Icon
                  name={count === module.lessons.length ? "check" : "arrow"}
                  size={17}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
