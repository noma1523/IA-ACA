# Spécification fonctionnelle — Académie IA

## Objectif
Construire une plateforme de formation à l'intelligence artificielle, en français, accessible aux novices, ergonomique, responsive et sobre (blanc, bleu, cartes aérées, emojis discrets). S'inspirer de l'organisation du `prototype-v9.html`, non de sa sécurité ni de son architecture technique.

## Contenu et pédagogie
- Programme officiel **22 modules / 132 leçons**, avec les titres et l'ordre exacts intégrés dans le prototype. **Module 02 facultatif** (remise à niveau numérique) : il ne doit pas bloquer le parcours des autres modules.
- Leçon 1 : « Définition et grandes familles », dans le module 01 « Découvrir l’IA et réussir son premier échange ».
- Chaque page de leçon : vidéo en haut, **cours écrit complet immédiatement en dessous**, exemples et explications pratiques intégrés au texte ; pas de PDF téléchargeable dans le parcours standard ; mini-quiz de 10 questions à la fin.
- Quiz réussi au seuil provisoire de **8/10** (paramétrable). Reprises possibles selon politique administrative à confirmer. Ne débloquer la leçon suivante qu'après réussite. Conserver la progression même en cas d'abonnement expiré.
- Les vidéos et contenus détaillés ne sont pas tous produits : ne pas générer d'informations fausses ni afficher des vidéos factices comme si elles étaient disponibles.

## Pages étudiant
- Landing page publique, tarifs, inscription/connexion, compte et accès.
- Tableau de bord étudiant : « reprendre », progression globale et par module, modules et cours accessibles/fermés.
- Catalogue et navigation intuitive des 22 modules et 132 leçons, recherche, repères visuels.
- Lecteur vidéo, texte pédagogique riche, quiz interactif avec correction, résultat, progression.
- Réalisations/attestations : délivrer le certificat **uniquement après validation réelle des critères** (à définir). Attestation Académie IA, ne pas prétendre à une accréditation officielle.
- Club IA privé si formule éligible : fil de publications, catégories (IA, business, technologie/outils), sources, commentaires, favoris, signalement/modération.

## Offres validées (EUR)
| Identifiant | Prix | Période | Périmètre | Club IA |
|---|---:|---|---|---|
| essai | 5 € | 7 jours | module 01 (6 leçons) | non |
| mensuel | 29 € | 1 mois | 132 leçons | oui |
| flexible | 79 € | 3 mois | 132 leçons | non |
| flexible_club | 99 € | 3 mois | 132 leçons | oui |
| integrale | 119 € | 12 mois | 132 leçons | non |
| integrale_club | 149 € | 12 mois | 132 leçons | oui |

- À échéance sans renouvellement payé, **verrouiller immédiatement le contenu payant** et le Club IA, si applicable. Garder résultats/progression et certificats déjà obtenus consultables selon règles du compte.
- Prolongation cours seuls : après flexible **15 €/mois**, après intégrale **10 €/mois**.
- Prix de prolongation **avec Club IA non défini** : rendre la prolongation indisponible ou demander une nouvelle souscription clairement affichée ; ne pas inventer un prix ou renouveler automatiquement à l'insu du client.
- Le statut d'accès doit être issu du serveur et des événements du prestataire de paiement (webhooks vérifiés), jamais d'une date stockée uniquement dans le navigateur.
- Conditions d'abonnement, facturation, renouvellement, résiliation et droit de rétractation : prévoir une revue juridique pour le marché visé avant commercialisation.

## Back-office administrateur
- CRUD modules/leçons (attention à préserver l'ordre officiel), éditeur riche de cours écrit, URL/métadonnées vidéo ou gestion d'hébergement sécurisé, création et validation du quiz de 10 questions, aperçu de la page élève.
- Suivi des étudiants, inscriptions, droits d'accès, progression, paiements et résultats ; export administratif minimal.
- Éditeur de publications Club IA (brouillon, programmation facultative, publication, sources), commentaires/modération.
- Contrôles de rôles : élève, éditeur, administrateur ; droits vérifiés sur le serveur.

## Choix techniques proposés (à valider par Codex)
- Next.js + TypeScript, Tailwind CSS et composants accessibles, PostgreSQL hébergé (ou Supabase) pour le contenu et les comptes, politique d'autorisation serveur ; Stripe pour paiements si compatible avec la société/le pays d'exploitation.
- Vidéo via un prestataire adapté aux contenus privés avec liens temporisés ; aucune promesse de protection DRM parfaite.
- Déployer au départ une PWA responsive plutôt que des applications mobiles natives.
- Budget cible d'infrastructure au lancement : **20 à 50 € / mois hors commissions, production vidéo et coûts variables**. Établir un devis technique réaliste et signaler tout dépassement.
- Protection « un appareil » demandée à terme : n'implémenter qu'un contrôle de sessions raisonnable avec récupération d'accès, assistance et exceptions ; éviter d'affirmer une protection antipartage absolue.

## Sécurité et qualité
- Authentification sécurisée, réinitialisation de mot de passe, vérification d'email, confidentialité et consentements.
- Autorisation serveur pour chaque vidéo/cours/quiz/post, vérification d'abonnement, permissions administrateur ; ne jamais faire confiance aux seuls contrôles de l'interface.
- Protection XSS/CSRF, validation des contenus utilisateurs, limites d'envoi, stockage privé, sauvegardes et journalisation minimale.
- Conformité RGPD si utilisateurs européens, gestion des cookies, mentions légales et politique de conservation.
- Responsive clavier/mobile ; éviter les interfaces denses, animations distractives et multiples accordéons.

## Critères d'acceptation initiaux
1. Une personne peut découvrir le programme et les six prix sans compte.
2. La navigation retrouve tous les 22 modules et les 132 intitulés sans perte ni doublon.
3. Le module 02 facultatif ne bloque pas la suite du cursus.
4. La page de cours comporte lecteur vidéo, cours écrit sous la vidéo et quiz (10 questions) ; la leçon suivante ne s'ouvre qu'après réussite.
5. La progression se sauvegarde dans un vrai compte et survit à l'expiration du forfait.
6. Un forfait sans Club n'accède à aucun fil ni API du Club.
7. Aucun étudiant expiré n'accède à du contenu réservé, même via URL directe ou API.
8. Les données et comptes étudiants sont isolés entre utilisateurs.
9. Les contenus et publications sont éditables uniquement par des rôles autorisés.
10. Le parcours reste simple et lisible sur téléphone et ordinateur.

## Plan de migration prudent
La V9 HTML peut servir de preuve de concept, de source du catalogue et de référence UX. Ne pas recopier en production ses mécanismes localStorage, activation simulée, faux comptes et contrôle d'accès JavaScript. Construire la vraie application autour de règles métier testées et d'API sécurisées.
