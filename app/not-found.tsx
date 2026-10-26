import Link from "next/link";
export default function NotFound() {
  return (
    <section className="panel empty-state">
      <p className="eyebrow">PAGE INTROUVABLE</p>
      <h1>Reprenons le bon chemin.</h1>
      <p>Cette page n’existe pas ou n’est plus disponible.</p>
      <Link href="/programme" className="button primary">
        Explorer le programme
      </Link>
    </section>
  );
}
