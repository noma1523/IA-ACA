"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { lessons, modules, pad } from "@/lib/catalogue";
import type { Content, Post, Question } from "@/lib/types";
import { post } from "@/lib/client";
import { Icon } from "./icon";
export type StudentRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  completed: number;
  plan: string | null;
};
export type ReportRow = { post_id: string; title: string; count: number };
export type ModerationComment = { id: string; name: string; body: string };
export function Admin({
  initial,
  posts,
  students,
  reports,
  comments,
  passThreshold,
  isAdmin,
}: {
  initial: Content;
  posts: Post[];
  students: StudentRow[];
  reports: ReportRow[];
  comments: ModerationComment[];
  passThreshold: number;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [tab, setTab] = useState("contenus"),
    [selected, setSelected] = useState(initial.lesson_id),
    [body, setBody] = useState(initial.body),
    [video, setVideo] = useState(initial.video_url),
    [published, setPublished] = useState(!!initial.published),
    [quiz, setQuiz] = useState<Question[]>(JSON.parse(initial.quiz_json)),
    [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  async function save(data: unknown) {
    setPending(true);
    setError("");
    setNotice("");
    try {
      await post("/api/admin", data);
      setNotice("Modifications enregistrées.");
      router.refresh();
      return true;
    } catch (error) {
      setError((error as Error).message);
      return false;
    } finally {
      setPending(false);
    }
  }
  async function load(id: string) {
    setPending(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(
        "/api/admin?lesson=" + encodeURIComponent(id),
      );
      const content = await response.json();
      if (!response.ok) throw Error(content.error);
      setSelected(id);
      setBody(content.body);
      setVideo(content.video_url);
      setPublished(!!content.published);
      setQuiz(JSON.parse(content.quiz_json));
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setPending(false);
    }
  }
  function updateQuestion(index: number, values: Partial<Question>) {
    setQuiz(
      quiz.map((question, i) =>
        i === index ? { ...question, ...values } : question,
      ),
    );
  }
  async function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget,
      data = new FormData(form);
    if (
      await save({
        action: "post",
        postId: editingPost?.id,
        title: data.get("title"),
        body: data.get("body"),
        category: data.get("category"),
        sourceUrl: data.get("source"),
        published: data.get("published") === "on",
      })
    ) {
      form.reset();
      setEditingPost(null);
    }
  }
  return (
    <>
      <div className="filter-tabs" aria-label="Sections de l’administration">
        {[
          ["contenus", "Cours et quiz"],
          ["club", "Club et modération"],
          ...(isAdmin
            ? [
                ["students", "Étudiants"],
                ["settings", "Réglages"],
              ]
            : []),
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => {
              setTab(id);
              setError("");
              setNotice("");
            }}
            className={tab === id ? "selected" : ""}
            aria-pressed={tab === id}
          >
            {label}
          </button>
        ))}
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="success-message" role="status">
          {notice}
        </p>
      )}
      {tab === "contenus" && (
        <form
          className="panel editor-form"
          onSubmit={(event) => {
            event.preventDefault();
            save({
              action: "lesson",
              lessonId: selected,
              body,
              videoUrl: video,
              published,
              quiz,
            });
          }}
        >
          <div className="row between">
            <h2>Préparer une leçon</h2>
            <span className={`badge ${published ? "green" : ""}`}>
              {published ? "Publiée" : "Brouillon"}
            </span>
          </div>
          <label>
            Choisir la leçon
            <select
              value={selected}
              disabled={pending}
              onChange={(event) => load(event.target.value)}
            >
              {modules.map((module) => (
                <optgroup
                  key={module.id}
                  label={`Module ${pad(module.id)} — ${module.title}`}
                >
                  {module.lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {pad(lesson.number)}. {lesson.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <p className="muted small">
            L’ordre et les intitulés du catalogue sont préservés. Enregistrez
            vos modifications avant de changer de leçon.
          </p>
          <div className="two-columns">
            <label>
              Adresse HTTPS de la vidéo
              <input
                value={video}
                onChange={(event) => setVideo(event.target.value)}
                type="url"
                placeholder="https://…/video.mp4"
              />
              <small className="muted">
                Fichier vidéo compatible avec le navigateur. L’hébergement privé
                reste à intégrer.
              </small>
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={published}
                onChange={(event) => setPublished(event.target.checked)}
              />{" "}
              Publier le cours pour les élèves autorisés
            </label>
          </div>
          <label>
            Le cours écrit
            <textarea
              rows={14}
              maxLength={40000}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Rédigez le cours. Séparez les paragraphes par une ligne vide ; commencez un intertitre par ##."
            />
            <small className="muted">
              Paragraphes et intertitres simples. Aucun code HTML ne sera
              exécuté.
            </small>
          </label>
          <div className="section-heading">
            <div>
              <h2>Le quiz de la leçon</h2>
              <p className="muted small">
                10 questions, 4 choix et une seule bonne réponse par question.
              </p>
            </div>
            {quiz.length === 0 && (
              <button
                type="button"
                className="button secondary"
                onClick={() =>
                  setQuiz(
                    Array.from({ length: 10 }, () => ({
                      question: "",
                      options: ["", "", "", ""],
                      correctIndex: 0,
                    })),
                  )
                }
              >
                Préparer les 10 questions
              </button>
            )}
          </div>
          {quiz.map((question, index) => (
            <details className="question-editor" key={index}>
              <summary>
                Question {index + 1} — {question.question || "À renseigner"}
              </summary>
              <label>
                La question
                <input
                  required
                  value={question.question}
                  maxLength={1000}
                  onChange={(event) =>
                    updateQuestion(index, { question: event.target.value })
                  }
                />
              </label>
              <div className="two-columns">
                {question.options.map((option, i) => (
                  <label key={i}>
                    Choix {"ABCD"[i]}
                    <input
                      required
                      maxLength={1000}
                      value={option}
                      onChange={(event) =>
                        updateQuestion(index, {
                          options: question.options.map((value, j) =>
                            j === i ? event.target.value : value,
                          ),
                        })
                      }
                    />
                  </label>
                ))}
              </div>
              <label>
                Bonne réponse
                <select
                  value={question.correctIndex}
                  onChange={(event) =>
                    updateQuestion(index, {
                      correctIndex: Number(event.target.value),
                    })
                  }
                >
                  {["A", "B", "C", "D"].map((letter, i) => (
                    <option key={letter} value={i}>
                      Choix {letter}
                    </option>
                  ))}
                </select>
              </label>
            </details>
          ))}
          <div className="editor-save">
            <button disabled={pending} className="button primary">
              {pending ? "Enregistrement…" : "Enregistrer la leçon"}
              <Icon name="check" size={17} />
            </button>
            <a
              href={`/cours/${selected}`}
              target="_blank"
              rel="noopener noreferrer"
              className="button secondary"
            >
              Voir la page élève
            </a>
            <span className="muted small">
              {lessons.find((lesson) => lesson.id === selected)?.title}
            </span>
          </div>
        </form>
      )}
      {tab === "club" && (
        <>
          <form
            key={editingPost?.id || "new"}
            className="panel editor-form"
            onSubmit={createPost}
          >
            <h2>Une publication pour le Club</h2>
            <div className="two-columns">
              <label>
                Titre
                <input
                  name="title"
                  maxLength={120}
                  required
                  defaultValue={editingPost?.title || ""}
                />
              </label>
              <label>
                Catégorie
                <select
                  name="category"
                  defaultValue={editingPost?.category || "IA"}
                >
                  {["IA", "Business", "Outils", "Conseils"].map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Texte
              <textarea
                name="body"
                maxLength={5000}
                rows={6}
                required
                defaultValue={editingPost?.body || ""}
              />
            </label>
            <label>
              Lien source (facultatif)
              <input
                name="source"
                type="url"
                placeholder="https://…"
                defaultValue={editingPost?.source_url || ""}
              />
            </label>
            <label className="checkbox-field">
              <input
                name="published"
                type="checkbox"
                defaultChecked={editingPost?.status === "published"}
              />{" "}
              Publier maintenant dans le Club
            </label>
            <button className="button primary" disabled={pending}>
              Enregistrer la publication
            </button>
            {editingPost && (
              <button
                type="button"
                className="button secondary"
                onClick={() => setEditingPost(null)}
              >
                Préparer une nouvelle publication
              </button>
            )}
          </form>
          <section className="panel info-panel">
            <h2>Publications</h2>
            {posts.map((entry) => (
              <div className="admin-list-row" key={entry.id}>
                <div>
                  <strong>{entry.title}</strong>
                  <small className="muted">
                    {entry.category} ·{" "}
                    {entry.status === "published" ? "Publiée" : "Brouillon"}
                  </small>
                </div>
                <div className="row">
                  <button
                    disabled={pending}
                    className="text-button"
                    onClick={() => {
                      setEditingPost(entry);
                      setNotice(
                        "Publication ouverte dans le formulaire ci-dessus.",
                      );
                    }}
                  >
                    Modifier
                  </button>
                  <button
                    disabled={pending}
                    className="text-button danger"
                    onClick={async () => {
                      if (
                        (await save({
                          action: "deletePost",
                          postId: entry.id,
                        })) &&
                        editingPost?.id === entry.id
                      )
                        setEditingPost(null);
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </section>
          <section className="panel info-panel">
            <h2>Signalements</h2>
            {reports.length ? (
              reports.map((report) => (
                <div className="admin-list-row" key={report.post_id}>
                  <span>
                    {report.title} · {report.count} signalement(s)
                  </span>
                  <button
                    className="text-button danger"
                    disabled={pending}
                    onClick={() =>
                      save({ action: "deletePost", postId: report.post_id })
                    }
                  >
                    Retirer la publication
                  </button>
                </div>
              ))
            ) : (
              <p className="muted">Aucun signalement.</p>
            )}
            <h2>Commentaires récents</h2>
            {comments.length ? (
              comments.map((comment) => (
                <div className="admin-list-row" key={comment.id}>
                  <div>
                    <strong>{comment.name}</strong>
                    <p>{comment.body}</p>
                  </div>
                  <button
                    className="text-button danger"
                    disabled={pending}
                    onClick={() =>
                      save({ action: "deleteComment", commentId: comment.id })
                    }
                  >
                    Supprimer
                  </button>
                </div>
              ))
            ) : (
              <p className="muted">Aucun commentaire.</p>
            )}
          </section>
        </>
      )}
      {tab === "students" && isAdmin && (
        <section className="panel info-panel">
          <h2>Les comptes de votre académie</h2>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>Rôle</th>
                  <th>Formule</th>
                  <th>Progression</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.name}</strong>
                      <small>{student.email}</small>
                    </td>
                    <td>{student.role}</td>
                    <td>{student.plan || "Aucune"}</td>
                    <td>{student.completed} / 132</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted small">
            Les 100 comptes les plus récents. Les droits administrateur sont
            attribués depuis la machine de développement.
          </p>
        </section>
      )}
      {tab === "settings" && isAdmin && (
        <form
          className="panel editor-form"
          onSubmit={(event) => {
            event.preventDefault();
            save({
              action: "threshold",
              threshold: Number(
                new FormData(event.currentTarget).get("threshold"),
              ),
            });
          }}
        >
          <h2>Validation des quiz</h2>
          <label>
            Nombre de bonnes réponses nécessaires sur 10
            <input
              name="threshold"
              type="number"
              min={1}
              max={10}
              defaultValue={passThreshold}
              required
            />
          </label>
          <p className="muted">
            Le nouveau seuil s’applique aux tentatives suivantes. Les
            validations déjà obtenues sont conservées.
          </p>
          <button className="button primary" disabled={pending}>
            Enregistrer le seuil
          </button>
        </form>
      )}
    </>
  );
}
