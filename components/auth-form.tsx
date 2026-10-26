"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { post } from "@/lib/client";
import { Icon } from "./icon";
export function AuthForm({ register }: { register: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await post("/api/auth", {
        action: register ? "register" : "login",
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      });
      router.push(register ? "/offres" : "/espace");
      router.refresh();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="auth-wrap">
      <div className="auth-card panel">
        <span className="auth-symbol">
          <Icon name="cap" size={32} />
        </span>
        <p className="eyebrow">VOTRE ESPACE ACADÉMIE IA</p>
        <h1>
          {register
            ? "La curiosité commence ici."
            : "Heureux de vous retrouver."}
        </h1>
        <p className="muted">
          {register
            ? "Créez votre compte pour conserver vos progrès, une leçon après l’autre."
            : "Connectez-vous pour reprendre votre parcours."}
        </p>
        <form method="post" onSubmit={submit} className="form-stack">
          {register && (
            <label>
              Votre nom
              <input
                name="name"
                autoComplete="name"
                minLength={2}
                maxLength={80}
                required
                placeholder="Camille Dupont"
              />
            </label>
          )}
          <label>
            Adresse email
            <input
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              placeholder="vous@exemple.fr"
            />
          </label>
          <label>
            Mot de passe
            <input
              name="password"
              type="password"
              autoComplete={register ? "new-password" : "current-password"}
              minLength={10}
              maxLength={128}
              required
              aria-describedby="password-hint"
            />
          </label>
          <small id="password-hint" className="muted">
            10 caractères minimum. Utilisez un mot de passe propre à cet espace
            de test.
          </small>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button primary full" disabled={pending || !ready}>
            {pending
              ? "Un instant…"
              : register
                ? "Créer mon compte"
                : "Me connecter"}
            <Icon name="arrow" size={18} />
          </button>
        </form>
        <p className="auth-switch">
          {register
            ? "Vous avez déjà un compte ?"
            : "Vous découvrez l’Académie ?"}{" "}
          <Link href={register ? "/connexion" : "/inscription"}>
            {register ? "Se connecter" : "Créer mon compte"}
          </Link>
        </p>
        <p className="small muted">
          Version de développement : la vérification d’email et la récupération
          du mot de passe restent à intégrer. Utilisez des informations de test.
        </p>
      </div>
      <div className="auth-note">
        <Icon name="shield" size={17} /> Votre progression reste liée à votre
        compte.
      </div>
    </div>
  );
}
