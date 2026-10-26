import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./icon";
export function Intro({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-intro">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {text && <p className="intro-text">{text}</p>}
      </div>
      {action}
    </div>
  );
}
export function Notice({
  title,
  children,
  kind = "",
}: {
  title?: string;
  children: ReactNode;
  kind?: string;
}) {
  return (
    <div className={`notice ${kind}`}>
      <Icon name="shield" />
      <div>
        {title && <strong>{title}</strong>}
        <div>{children}</div>
      </div>
    </div>
  );
}
export function Locked({
  title = "Votre prochaine étape",
  text,
  loggedIn,
}: {
  title?: string;
  text: string;
  loggedIn: boolean;
}) {
  return (
    <section className="empty-state panel">
      <span className="empty-icon">
        <Icon name="lock" size={30} />
      </span>
      <h2>{title}</h2>
      <p>{text}</p>
      <div className="button-row">
        <Link
          className="button primary"
          href={loggedIn ? "/offres" : "/connexion"}
        >
          {loggedIn ? "Voir les formules" : "Me connecter"}{" "}
          <Icon name="arrow" size={17} />
        </Link>
        <Link className="button secondary" href="/programme">
          Voir le programme
        </Link>
      </div>
    </section>
  );
}
export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
