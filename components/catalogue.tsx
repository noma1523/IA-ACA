"use client";
import Link from "next/link";
import { useState } from "react";
import { modules, pad } from "@/lib/catalogue";
import { Icon } from "./icon";
export function Catalogue() {
  const [query, setQuery] = useState("");
  const normalized = query
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
  const matches = (value: string) =>
    value
      .toLocaleLowerCase("fr")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .includes(normalized);
  const filtered = modules
    .map((module) => ({
      ...module,
      lessons: matches(module.title)
        ? module.lessons
        : module.lessons.filter((lesson) => matches(lesson.title)),
    }))
    .filter((module) => module.lessons.length);
  return (
    <>
      <div className="catalogue-toolbar">
        <label className="search-box">
          <Icon name="search" />
          <span className="sr-only">Rechercher un module ou une leçon</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Un sujet, une envie, une compétence…"
          />
        </label>
        <span className="muted small" aria-live="polite">
          {filtered.length} modules ·{" "}
          {filtered.reduce((n, m) => n + m.lessons.length, 0)} leçons
        </span>
      </div>
      <div className="catalogue-grid">
        {filtered.map((module) => (
          <details
            key={module.id + (normalized ? "search" : "all")}
            open={!!normalized}
            className="catalogue-module"
            id={`module-${module.id}`}
            data-module
          >
            <summary>
              <span className="module-emoji">{module.emoji}</span>
              <span className="summary-copy">
                <small>
                  MODULE {pad(module.id)}{" "}
                  {module.optional && (
                    <span className="optional-label">FACULTATIF</span>
                  )}
                </small>
                <strong>{module.title}</strong>
                <span>{module.lessons.length} leçons</span>
              </span>
              <span className="summary-plus">+</span>
            </summary>
            <ol>
              {module.lessons.map((lesson) => (
                <li key={lesson.id} data-lesson>
                  <Link href={`/cours/${lesson.id}`}>
                    <span>{pad(lesson.number)}</span>
                    {lesson.title}
                    <Icon name="arrow" size={15} />
                  </Link>
                </li>
              ))}
            </ol>
          </details>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state panel">
          <h2>Aucun résultat pour cette recherche.</h2>
          <p>Essayez un autre mot ou explorez le programme complet.</p>
          <button className="button secondary" onClick={() => setQuery("")}>
            Effacer la recherche
          </button>
        </div>
      )}
    </>
  );
}
