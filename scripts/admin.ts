import { db } from "../lib/database";
const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage : npm run admin -- adresse-du-compte");
  process.exit(1);
}
const result = db()
  .prepare("UPDATE users SET role = 'admin' WHERE email = ?")
  .run(email);
if (!result.changes) {
  console.error(
    "Compte introuvable. Créez d’abord un compte dans l’application.",
  );
  process.exit(1);
}
console.log("Droits administrateur attribués au compte existant.");
