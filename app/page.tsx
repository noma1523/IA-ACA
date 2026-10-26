import Link from "next/link";
import { Icon } from "@/components/icon";
import { modules, pad } from "@/lib/catalogue";
export default function Home() {
  return (
    <>
      <div className="home-heading">
        <span className="eyebrow">BIENVENUE À L’ACADÉMIE IA</span>
        <span className="muted small">
          Votre curiosité est le meilleur point de départ.
        </span>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <span className="badge">
            <span className="status-dot" /> Pour les curieux, pas seulement les
            experts
          </span>
          <h1>
            Comprendre l’IA.
            <br />
            Et en faire <span>quelque chose.</span>
          </h1>
          <p>
            Des premiers échanges aux projets concrets, apprenez à utiliser
            l’intelligence artificielle avec méthode, confiance et esprit
            critique.
          </p>
          <div className="button-row">
            <Link href="/inscription" className="button primary">
              Commencer mon parcours <Icon name="arrow" size={18} />
            </Link>
            <Link href="/programme" className="button secondary">
              Découvrir le programme
            </Link>
          </div>
          <div className="hero-footnote">
            <Icon name="check" size={16} /> À votre rythme <span>·</span>
            <Icon name="check" size={16} /> Aucun prérequis technique
          </div>
        </div>
        <div className="hero-illustration">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="floating-spark">
            <Icon name="spark" size={28} />
          </div>
          <div className="path-card">
            <div className="row between">
              <span className="eyebrow">VOTRE PARCOURS</span>
              <span className="badge pale">Pas à pas</span>
            </div>
            <h3>
              Une nouvelle compétence.
              <br />À chaque étape.
            </h3>
            {[modules[0], modules[3], modules[16]].map((module, index) => (
              <div className="path-step" key={module.id}>
                <span className={`path-number path-${index}`}>
                  {index === 0 ? (
                    <Icon name="play" size={15} />
                  ) : (
                    <Icon name={index === 1 ? "spark" : "trophy"} size={17} />
                  )}
                </span>
                <span>
                  <small>ÉTAPE {pad(index + 1)}</small>
                  <strong>
                    {
                      [
                        "Découvrir les bases",
                        "Passer à la pratique",
                        "Réaliser son projet",
                      ][index]
                    }
                  </strong>
                </span>
                {index === 0 && (
                  <span className="path-start">On commence ici</span>
                )}
              </div>
            ))}
            <div className="path-note">
              <Icon name="shield" size={16} /> Apprendre, essayer, vérifier.
              Puis avancer.
            </div>
          </div>
          <div className="floating-label">
            <span>💡</span>
            <div>
              <strong>Vous pouvez le faire.</strong>
              <small>Une leçon après l’autre.</small>
            </div>
          </div>
        </div>
      </section>
      <section className="quick-stats" aria-label="Le parcours en chiffres">
        {[
          ["book", "22", "modules progressifs", "Des bases aux projets"],
          ["play", "132", "leçons au programme", "Vidéo, lecture et pratique"],
          ["check", "10", "questions par quiz", "Pour consolider vos acquis"],
          [
            "clock",
            "À votre rythme",
            "sans course à la performance",
            "Votre temps, votre parcours",
          ],
        ].map(([icon, value, label, detail]) => (
          <div className="quick-stat" key={label}>
            <span className="stat-icon">
              <Icon name={icon} size={22} />
            </span>
            <div>
              <strong>{value}</strong>
              <span>{label}</span>
              <small>{detail}</small>
            </div>
          </div>
        ))}
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">UN PARCOURS QUI A DU SENS</p>
            <h2>Du premier « bonjour » à votre premier projet.</h2>
            <p className="muted">
              Chaque module construit la suite. Vous gardez le fil, sans vous
              perdre.
            </p>
          </div>
          <Link className="inline-link" href="/programme">
            Tout le programme <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="feature-grid">
          {modules.slice(0, 3).map((module) => (
            <Link
              href={`/programme#module-${module.id}`}
              className="module-preview"
              key={module.id}
            >
              <div className="row between">
                <span className="module-emoji">{module.emoji}</span>
                <span className="muted small">MODULE {pad(module.id)}</span>
              </div>
              <h3>{module.title}</h3>
              <p>
                {module.optional
                  ? "Une remise à niveau facultative, selon vos besoins."
                  : module.id === 1
                    ? "Comprenez les fondamentaux et osez votre premier échange."
                    : "Découvrez les usages utiles et les bons réflexes de confidentialité."}
              </p>
              <div className="row between">
                <span className="muted small">
                  {module.lessons.length} leçons{" "}
                  {module.optional && "· Facultatif"}
                </span>
                <Icon name="arrow" size={18} />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="learn-strip">
        <div className="strip-symbol">
          <Icon name="spark" size={29} />
        </div>
        <div>
          <h2>Moins de jargon. Plus de déclics.</h2>
          <p>
            Une vidéo, un cours écrit juste en dessous, puis un quiz pour
            vérifier que tout est clair.
          </p>
        </div>
        <Link href="/offres" className="button secondary">
          Choisir ma formule <Icon name="arrow" size={17} />
        </Link>
      </section>
    </>
  );
}
