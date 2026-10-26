"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { FeedPost } from "@/lib/types";
import { post } from "@/lib/client";
import { dateLabel } from "@/lib/plans";
import { Icon } from "./icon";
export function ClubFeed({ posts }: { posts: FeedPost[] }) {
  const router = useRouter(),
    [filter, setFilter] = useState("Tout"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [pending, setPending] = useState(false);
  async function action(postId: string, kind: string, body?: string) {
    setError("");
    setNotice("");
    setPending(true);
    try {
      await post("/api/club", { postId, action: kind, body });
      if (kind === "report") setNotice("Signalement transmis à l’équipe.");
      router.refresh();
      return true;
    } catch (error) {
      setError((error as Error).message);
      return false;
    } finally {
      setPending(false);
    }
  }
  async function comment(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const form = event.currentTarget;
    if (await action(id, "comment", String(new FormData(form).get("body"))))
      form.reset();
  }
  const filtered = posts.filter(
    (post) =>
      filter === "Tout" ||
      (filter === "Enregistrés" && post.bookmarked) ||
      filter === post.category,
  );
  return (
    <>
      <div className="filter-tabs" aria-label="Catégories">
        {["Tout", "IA", "Business", "Outils", "Conseils", "Enregistrés"].map(
          (category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={filter === category ? "selected" : ""}
              aria-pressed={filter === category}
            >
              {category}
            </button>
          ),
        )}
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="success-message">
          {notice}
        </p>
      )}
      <div className="club-grid">
        {filtered.map((entry) => (
          <article className="panel club-post" key={entry.id}>
            <div className="row between">
              <span className="badge pale">{entry.category}</span>
              <small className="muted">{dateLabel(entry.created_at)}</small>
            </div>
            <h2>{entry.title}</h2>
            <p className="preserve-lines">{entry.body}</p>
            {entry.source_url && (
              <a
                className="inline-link"
                href={entry.source_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Consulter la source <Icon name="arrow" size={15} />
              </a>
            )}
            <div className="post-actions">
              <button
                disabled={pending}
                className={`text-button ${entry.bookmarked ? "blue" : ""}`}
                onClick={() => action(entry.id, "bookmark")}
              >
                <Icon name="bookmark" size={17} />
                {entry.bookmarked ? "Enregistré" : "Enregistrer"}
              </button>
              <span className="row small muted">
                <Icon name="chat" size={17} />
                {entry.comments.length} commentaire
                {entry.comments.length > 1 ? "s" : ""}
              </span>
              <button
                disabled={pending}
                className="text-button muted"
                onClick={() => action(entry.id, "report")}
              >
                Signaler
              </button>
            </div>
            <details className="comments">
              <summary>Échanger sur cette publication</summary>
              {entry.comments.map((comment) => (
                <div className="comment" key={comment.id}>
                  <strong>{comment.name}</strong>
                  <p>{comment.body}</p>
                </div>
              ))}
              <form onSubmit={(event) => comment(event, entry.id)}>
                <label>
                  Votre commentaire
                  <textarea name="body" required maxLength={1000} rows={2} />
                </label>
                <button className="button secondary" disabled={pending}>
                  Publier mon commentaire
                </button>
              </form>
            </details>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state panel">
          <h2>La conversation commence bientôt.</h2>
          <p>Aucune publication dans cette catégorie pour le moment.</p>
        </div>
      )}
    </>
  );
}
