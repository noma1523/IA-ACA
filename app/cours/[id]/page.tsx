import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import {
  findLesson,
  modules,
  nextLesson,
  pad,
  prerequisite,
} from "@/lib/catalogue";
import {
  accessFor,
  contentFor,
  publicContent,
  threshold,
  completedFor,
} from "@/lib/store";
import { Intro, Locked, Notice } from "@/components/ui";
import { Quiz } from "@/components/quiz";
import { Icon } from "@/components/icon";
export default async function Course({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    lesson = findLesson(id);
  if (!lesson) notFound();
  const user = await currentUser();
  const reason = user
    ? accessFor(user, id)
    : "Connectez-vous à votre compte pour retrouver les cours et votre progression.";
  const module = modules[lesson.moduleId - 1];
  if (reason) {
    const previous = prerequisite(lesson);
    return (
      <>
        <Intro
          eyebrow={`MODULE ${pad(module.id)} · LEÇON ${pad(lesson.number)}`}
          title={lesson.title}
        />
        <Locked text={reason} loggedIn={!!user} />
        {user && previous && (
          <p className="center">
            <Link className="inline-link" href={`/cours/${previous}`}>
              Retrouver la leçon précédente <Icon name="arrow" size={16} />
            </Link>
          </p>
        )}
      </>
    );
  }
  const content = publicContent(contentFor(id)!);
  const complete = completedFor(user!.id).has(id);
  return (
    <>
      <div className="breadcrumb">
        <Link href="/programme">Programme</Link>
        <span>/</span>
        <Link href={`/programme#module-${module.id}`}>
          Module {pad(module.id)}
        </Link>
        <span>/</span>Leçon {pad(lesson.number)}
      </div>
      <Intro
        title={lesson.title}
        text={module.title}
        action={
          complete ? (
            <span className="badge green">
              <Icon name="check" size={16} /> Leçon validée
            </span>
          ) : (
            <span className="badge">À votre rythme</span>
          )
        }
      />
      <div className="course-layout">
        <div className="course-main">
          <section className="panel video-panel">
            <div className="row between">
              <h2>
                <Icon name="play" /> La vidéo
              </h2>
              <span className="muted small">Leçon {pad(lesson.number)}</span>
            </div>
            {content.video_url ? (
              <video
                controls
                preload="none"
                src={content.video_url}
                aria-label={`Vidéo : ${lesson.title}`}
              />
            ) : (
              <div className="video-placeholder">
                <span>
                  <Icon name="play" size={30} />
                </span>
                <strong>La vidéo est en préparation</strong>
                <p>Elle sera ajoutée ici après validation par l’équipe.</p>
              </div>
            )}
          </section>
          <article className="panel reading">
            <span className="eyebrow">PRENDRE LE TEMPS DE COMPRENDRE</span>
            <h2>Le cours écrit</h2>
            {content.body ? (
              content.body
                .split(/\n\s*\n/)
                .map((paragraph, index) =>
                  paragraph.startsWith("## ") ? (
                    <h3 key={index}>{paragraph.slice(3)}</h3>
                  ) : (
                    <p key={index}>{paragraph}</p>
                  ),
                )
            ) : (
              <Notice title="Ce cours est à préparer.">
                Son intitulé et sa place dans le programme sont confirmés. Le
                contenu pédagogique reste à rédiger et à vérifier.
              </Notice>
            )}
          </article>
          <Quiz
            lessonId={id}
            questions={content.questions}
            threshold={threshold()}
            nextId={nextLesson(lesson)?.id}
          />
        </div>
        <aside className="course-aside panel">
          <span className="eyebrow">MODULE {pad(module.id)}</span>
          <h3>
            {module.emoji} {module.title}
          </h3>
          <nav aria-label="Leçons du module">
            {module.lessons.map((item) => (
              <Link
                key={item.id}
                href={`/cours/${item.id}`}
                className={item.id === id ? "current" : ""}
              >
                <span>{pad(item.position)}</span>
                {item.title}
              </Link>
            ))}
          </nav>
          {module.optional && (
            <p className="small muted">
              Ce module est facultatif. Vous pouvez poursuivre le parcours
              principal sans le valider.
            </p>
          )}
          <Link className="inline-link" href="/espace">
            Mon tableau de bord <Icon name="arrow" size={16} />
          </Link>
        </aside>
      </div>
    </>
  );
}
