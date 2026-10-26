"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { post } from "@/lib/client";
import type { PublicQuestion } from "@/lib/types";
import { Icon } from "./icon";
import { ProgressBar } from "./ui";
type Result = {
  score: number;
  passed: boolean;
  threshold: number;
  correction: { question: string; correctAnswer: string }[];
};
export function Quiz({
  lessonId,
  questions,
  threshold,
  nextId,
}: {
  lessonId: string;
  questions: PublicQuestion[];
  threshold: number;
  nextId?: string;
}) {
  const router = useRouter();
  const [started, setStarted] = useState(false),
    [index, setIndex] = useState(0),
    [answers, setAnswers] = useState<number[]>(Array(10).fill(-1)),
    [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [result, setResult] = useState<Result | null>(null);
  async function submit() {
    setPending(true);
    setError("");
    try {
      const result = await post<Result>(`/api/lessons/${lessonId}/quiz`, {
        answers,
      });
      setResult(result);
      router.refresh();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setPending(false);
    }
  }
  if (questions.length !== 10)
    return (
      <section className="panel quiz-panel">
        <span className="badge">QUIZ À PRÉPARER</span>
        <h2>Chaque leçon mérite ses propres questions.</h2>
        <p className="muted">
          Le questionnaire de cette leçon sera disponible après validation de
          son contenu.
        </p>
      </section>
    );
  if (result)
    return (
      <section className="panel quiz-panel" aria-live="polite">
        <div className={`quiz-result ${result.passed ? "success" : ""}`}>
          <span className="empty-icon">
            <Icon name={result.passed ? "trophy" : "book"} size={28} />
          </span>
          <h2>
            {result.passed
              ? "Leçon validée, bravo !"
              : "Vous progressez, continuez."}
          </h2>
          <strong className="result-score">
            {result.score}
            <small>/10</small>
          </strong>
          <p>
            {result.passed
              ? "Votre résultat est enregistré dans votre compte. La suite est débloquée."
              : `Le seuil est de ${result.threshold}/10. Relisez les points utiles puis réessayez.`}
          </p>
          <div className="button-row centered">
            {result.passed && nextId && (
              <Link className="button primary" href={`/cours/${nextId}`}>
                Leçon suivante <Icon name="arrow" size={18} />
              </Link>
            )}
            <button
              className="button secondary"
              onClick={() => {
                setResult(null);
                setStarted(false);
                setIndex(0);
                setAnswers(Array(10).fill(-1));
              }}
            >
              Refaire le quiz
            </button>
          </div>
        </div>
        <details className="correction">
          <summary>Comprendre mes réponses</summary>
          {result.correction.map((entry, i) => (
            <div key={i}>
              <strong>
                {i + 1}. {entry.question}
              </strong>
              <p>Réponse attendue : {entry.correctAnswer}</p>
            </div>
          ))}
        </details>
      </section>
    );
  if (!started)
    return (
      <section className="panel quiz-panel">
        <div className="row between">
          <span className="eyebrow">À VOUS DE JOUER</span>
          <span className="badge pale">10 questions</span>
        </div>
        <h2>Un petit quiz. Un vrai déclic.</h2>
        <p className="muted">
          {threshold} bonnes réponses sur 10 pour valider cette leçon. Vous
          pouvez réessayer ; votre meilleur résultat est conservé.
        </p>
        <button className="button primary" onClick={() => setStarted(true)}>
          Commencer le quiz <Icon name="arrow" size={18} />
        </button>
      </section>
    );
  const question = questions[index];
  return (
    <section className="panel quiz-panel">
      <div className="row between">
        <span className="eyebrow">QUIZ DE FIN DE LEÇON</span>
        <span className="muted small">Question {index + 1} sur 10</span>
      </div>
      <ProgressBar value={(index + 1) * 10} label="Avancement dans le quiz" />
      <fieldset className="quiz-question" data-testid="quiz-question">
        <legend>{question.question}</legend>
        {question.options.map((option, i) => (
          <label
            className={`quiz-option ${answers[index] === i ? "selected" : ""}`}
            key={i}
          >
            <input
              type="radio"
              name={`question-${index}`}
              value={i}
              checked={answers[index] === i}
              onChange={() =>
                setAnswers(answers.map((value, j) => (j === index ? i : value)))
              }
            />
            <span className="option-letter">{"ABCD"[i]}</span>
            <span>{option}</span>
          </label>
        ))}
      </fieldset>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="row between">
        <button
          className="button secondary"
          disabled={index === 0 || pending}
          onClick={() => setIndex(index - 1)}
        >
          Précédente
        </button>
        <button
          className="button primary"
          disabled={answers[index] < 0 || pending}
          onClick={() => (index === 9 ? submit() : setIndex(index + 1))}
        >
          {pending
            ? "Correction…"
            : index === 9
              ? "Corriger mon quiz"
              : "Question suivante"}
          <Icon name="arrow" size={16} />
        </button>
      </div>
    </section>
  );
}
