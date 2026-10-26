"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="panel empty-state">
      <h1>Une pause imprévue.</h1>
      <p>La page n’a pas pu se charger. Vous pouvez réessayer.</p>
      <button className="button primary" onClick={reset}>
        Réessayer
      </button>
    </section>
  );
}
