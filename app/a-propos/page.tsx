import { Intro, Notice } from "@/components/ui";
export default function About() {
  return (
    <>
      <Intro
        eyebrow="À PROPOS"
        title="Une première version pour avancer."
        text="Ce qui fonctionne aujourd’hui, et les étapes avant une ouverture au public."
      />
      <div className="panel reading">
        <h2>Cette livraison locale</h2>
        <p>
          Le programme reprend exactement les 22 modules et 132 intitulés du
          prototype validé. Les comptes, les sessions, les contenus édités, la
          progression et les échanges du Club sont stockés côté serveur dans une
          base SQLite locale.
        </p>
        <h2>Des contenus à construire</h2>
        <p>
          Le premier cours et son quiz viennent du prototype. Les 131 autres
          cours, les quiz correspondants et les vidéos restent à préparer. Ils
          sont signalés clairement et éditables dans l’administration.
        </p>
        <h2>Avant la commercialisation</h2>
        <p>
          Il reste à intégrer la vérification d’email, la récupération de mot de
          passe, un prestataire de paiement et ses webhooks vérifiés,
          l’hébergement privé des vidéos, les sauvegardes, le déploiement et la
          revue juridique des abonnements et de la protection des données.
        </p>
        <p>
          Cette version n’a pas vocation à recueillir des données personnelles
          réelles. Le budget d’hébergement devra être confirmé selon les
          prestataires et les volumes retenus.
        </p>
      </div>
      <Notice title="Aucune transaction réelle.">
        Les activations de formules sont exclusivement disponibles lorsque le
        mode démonstration est activé. Désactiver ce mode ferme les activations
        de test ; cela ne connecte pas de paiements.
      </Notice>
    </>
  );
}
