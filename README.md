# Académie IA

Première application locale issue du prototype HTML V9 : Next.js 16, React 19, TypeScript et SQLite côté serveur. L’interface reprend le parcours blanc/bleu en français, sur ordinateur et mobile.

## Démo gratuite sur GitHub Pages

La démo statique est préparée séparément de l’application serveur. Son URL cible est `https://noma1523.github.io/IA-ACA/`. Elle présente le prototype interactif original avec un avertissement permanent : profils, paiements et accès sont simulés ; la progression reste dans le navigateur.

```bash
npm run build:pages
```

Pour envoyer les fichiers générés sur la branche de publication avec les droits Git du compte connecté : `npm run deploy:pages`. Le script ne force pas les mises à jour et préserve un éventuel domaine personnalisé (`CNAME`).

La sortie `pages-site/` contient uniquement `index.html`, `prototype-v9.html` et `.nojekyll`. Aucun compte, mot de passe, fichier `.env` ou base SQLite locale n’est publié. Pour activer le site, ouvrir **Settings → Pages** du dépôt et choisir **Deploy from a branch → gh-pages → / (root)**. Le contenu de la branche `gh-pages` est la publication statique ; l’application Next.js complète reste dans la branche `main`.

GitHub Pages ne peut pas exécuter le serveur Node.js, les comptes réels ou SQLite de l’application ci-dessous. Cette démo ne constitue pas le déploiement de cette application serveur.

## Démarrer

Prérequis : **Node.js 24 ou plus récent**, npm. Aucun service externe, secret ou compte de paiement n’est nécessaire.

```bash
npm ci
npm run db:seed
npm run dev
```

Dans l’environnement cloud, utiliser le checkout existant `/workspace/IA-ACA`. Si le cache npm du compte n’est pas accessible : `npm ci --cache /workspace/.cache/npm`. Chaque tâche est déjà isolée ; inutile de créer un worktree.

Le serveur de développement utilise le port 3000. Les migrations et le seed sont aussi appliqués au premier accès à la base. Réexécuter le seed conserve les contenus édités, les comptes et la progression. Aucun identifiant administrateur n’est créé automatiquement.

Le mode démonstration est actif par défaut en développement. Pour le fixer explicitement, copier `.env.example` dans `.env.local`, ignoré par Git. Utiliser des données et des mots de passe de test.

## Parcours disponible

- Accueil, programme filtrable, **22 modules et 132 leçons** dans l’ordre exact du prototype ; module 02 facultatif.
- Les six formules validées : 5 €, 29 €, 79 €, 99 €, 119 €, 149 €, avec leurs durées et droits Club respectifs. Activation et expiration **simulées** uniquement.
- Inscription, connexion, déconnexion, mots de passe hachés avec scrypt, sessions opaques stockées sous forme d’empreintes et cookie HttpOnly.
- Tableau de bord et résultats persistants par compte ; conservation après expiration.
- Leçon avec emplacement vidéo, cours écrit juste en dessous, quiz de dix questions et correction côté serveur. Seuil initial **8/10**, paramétrable par l’administrateur.
- Accès aux cours, quiz et API du Club vérifiés côté serveur : offre, échéance, périmètre et prérequis. Le module 03 dépend de la fin du module 01, sans exiger le module 02.
- Club : publications par catégorie, commentaires, favoris, signalements et modération.
- Administration : cours, vidéo, quiz, brouillons/publication, publications Club, modération, liste des comptes et seuil de réussite. Rôles éditeur/administrateur vérifiés côté serveur.
- Vue des modules validés ; aucune attestation émise tant que ses critères ne sont pas définis.

Le premier cours et ses dix questions viennent du prototype. Les **131 autres contenus et quiz, ainsi que les vidéos, restent à produire** : leurs emplacements sont marqués « à préparer ». Aucune fausse vidéo ni leçon prétendument complète n’est générée. Le parcours des 132 leçons nécessite donc encore la préparation éditoriale.

## Accéder à l’administration

Créer un compte de test dans l’interface, puis attribuer ses droits depuis la machine :

```bash
npm run admin -- adresse-du-compte
```

Recharger la page et ouvrir Administration. La commande ne crée ni compte ni mot de passe. Il n’existe pas d’API publique de promotion de rôle. Un éditeur prépare/modère les contenus ; seuls les administrateurs voient les comptes étudiants et modifient le seuil des quiz.

Le cours écrit accepte du texte et des intertitres commençant par `##`. Les textes sont échappés par React. Une vidéo peut être renseignée par une URL HTTPS de fichier compatible avec le navigateur ; l’hébergement privé et les URL temporisées restent à intégrer.

## Données et configuration

| Variable                              | Valeur par défaut                                        | Usage                                                                                  |
| ------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `DATABASE_PATH`                       | `.data/academie.sqlite`                                  | Base persistante, chemin relatif à la racine ou absolu.                                |
| `DEMO_MODE`                           | Actif en développement ; inactif en production           | `true` autorise les activations/expirations fictives. `false` les refuse côté serveur. |
| `COOKIE_SECURE`                       | Actif en production hors démo ; inactif en développement | `true` pour HTTPS. `false` seulement pour les essais HTTP locaux.                      |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` | Chromium système s’il existe                             | Navigateur pour les tests. Sinon, installer celui de Playwright.                       |

Les tables sont définies dans `migrations/001_initial.sql`. Le seed crée les 132 emplacements de cours et une publication d’accueil de démonstration. Les réponses des quiz ne figurent pas dans le questionnaire envoyé aux élèves ; la correction est retournée après soumission. Un score envoyé par le client n’est pas utilisé.

La base `.data/` est ignorée par Git et doit être conservée sur un stockage persistant. Pour une copie simple de développement, arrêter d’abord les serveurs puis sauvegarder le dossier complet. Ne pas copier seulement le fichier principal d’une base WAL en cours d’écriture. Aucune sauvegarde automatique n’est encore installée.

SQLite permet de travailler sans infrastructure payante. PostgreSQL/Supabase reste une option pour l’hébergement multi-instance futur ; les requêtes et la migration actuelles ciblent explicitement SQLite.

## Vérifier

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Les tests unitaires couvrent le catalogue, les prérequis, les échéances exactes, les mois calendaires, les périmètres des formules, les mots de passe, les sessions et la notation persistante.

Les tests Playwright couvrent les pages publiques, la recherche, les prix, le menu mobile, l’inscription, le quiz complet, la falsification d’un score, l’isolation de deux comptes, l’expiration via URL/API, les rôles, les requêtes d’origine étrangère, l’édition persistante, l’échappement des contenus, les favoris, commentaires, signalements, publication et déconnexion. Ils créent leur propre base temporaire et leur serveur sur le port 3001.

**Arrêter le serveur `npm run dev` du même checkout avant les tests navigateur** : Next.js n’accepte qu’un serveur de développement par dossier de build. Les tests n’arrêtent pas un serveur existant. Dans cet environnement, Chromium est déjà installé. Ailleurs : `npx playwright install chromium`.

Pour tester le build en mode démonstration local :

```bash
npm run build
DEMO_MODE=true COOKIE_SECURE=false npm start
```

## Avant une ouverture au public

Cette livraison est une base de développement locale, sans déploiement public ni transaction réelle. Désactiver `DEMO_MODE` ferme les activations fictives ; cela ne raccorde pas de paiement.

Restent à intégrer et valider : vérification d’email et récupération du mot de passe, paiements avec webhooks vérifiés et idempotents, renouvellement/résiliation, hébergement privé des vidéos, contrôles de sessions supplémentaires, durcissement et supervision, sauvegardes/restauration, conditions légales/RGPD et déploiement. L’authentification locale est fonctionnelle pour le développement et n’est pas présentée comme un système audité pour la production.

La prolongation des formules avec Club n’a pas de prix validé : aucune prolongation automatique n’est proposée. Les critères des attestations restent à définir. Aucun tarif, cours manquant ou événement d’actualité n’a été inventé pour les compléter.

Le budget cible de 20 à 50 €/mois vient des spécifications ; aucun prestataire payant n’a été activé et aucun devis d’hébergement réel n’a été validé.

## Sources et organisation

- `academie_ia_dossier_codex.zip` : archive d’origine conservée.
- `SPECIFICATION.md`, `PROMPT_CODEX.md` : documents extraits sans modification de l’archive.
- `data/catalogue.json` : titres et ordre importés directement du prototype V9.
- `app/` : pages Next.js et API.
- `components/` : interface interactive et formulaires.
- `lib/` : catalogue, règles métier, base, authentification et données.
- `migrations/`, `scripts/` : schéma, seed idempotent et promotion locale d’administrateur.
- `tests/` : tests métier et parcours navigateur.

Les commandes de développement ne déclenchent aucun paiement. La commande explicite `deploy:pages` publie uniquement la démonstration statique dans GitHub ; les comptes et la base de l’application serveur n’en font pas partie.
