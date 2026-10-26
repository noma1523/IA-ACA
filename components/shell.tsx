"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Icon } from "./icon";
import { post } from "@/lib/client";
import type { User } from "@/lib/types";

const navigation = [
  ["/", "Découvrir l’Académie", "home"],
  ["/programme", "Le programme", "book"],
  ["/espace", "Mon tableau de bord", "grid"],
  ["/club", "Le Club IA", "users"],
  ["/attestations", "Mes attestations", "trophy"],
  ["/offres", "Les formules", "card"],
];
export function Shell({
  user,
  demo,
  children,
}: {
  user: User | null;
  demo: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    try {
      await post("/api/logout", {});
      router.push("/");
      router.refresh();
    } catch (error) {
      setError((error as Error).message);
    }
  }
  return (
    <div className="app-shell">
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>
      {open && (
        <button
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
          aria-label="Fermer le menu"
        />
      )}
      <aside id="navigation" className={`sidebar ${open ? "is-open" : ""}`}>
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-symbol">
            <Icon name="cap" size={25} />
          </span>
          <span>
            Académie<span className="brand-blue"> IA</span>
            <small>COMPRENDRE. PRATIQUER. AVANCER.</small>
          </span>
        </Link>
        <div className="nav-label">VOTRE PARCOURS</div>
        <nav aria-label="Navigation principale">
          {navigation.map(([href, label, icon]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`nav-item ${pathname === href ? "active" : ""}`}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {href === "/club" && <span className="nav-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-help">
          <span className="mini-icon">
            <Icon name="spark" />
          </span>
          <strong>Un pas à la fois.</strong>
          <p>Pas besoin d’être expert pour commencer. La curiosité suffit.</p>
          <Link href="/programme" onClick={() => setOpen(false)}>
            Explorer le parcours <Icon name="arrow" size={16} />
          </Link>
        </div>
        <div className="sidebar-bottom">
          {user && user.role !== "student" && (
            <Link
              className={`nav-item ${pathname === "/admin" ? "active" : ""}`}
              href="/admin"
              onClick={() => setOpen(false)}
            >
              <Icon name="settings" />
              Administration
            </Link>
          )}
          {user ? (
            <>
              <Link
                className="profile"
                href="/compte"
                onClick={() => setOpen(false)}
              >
                <span className="avatar">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <span>
                  <strong>{user.name}</strong>
                  <small>Mon compte</small>
                </span>
              </Link>
              <button className="text-button logout" onClick={logout}>
                <Icon name="logout" size={16} /> Se déconnecter
              </button>
            </>
          ) : (
            <Link
              className="button primary full"
              href="/connexion"
              onClick={() => setOpen(false)}
            >
              Se connecter <Icon name="arrow" size={16} />
            </Link>
          )}
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <small className="sidebar-copyright">
            © {new Date().getFullYear()} Académie IA
          </small>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="row">
            <button
              className="icon-button mobile-menu"
              aria-label="Menu"
              aria-controls="navigation"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <Icon name={open ? "close" : "menu"} />
            </button>
            <span className="topbar-label">
              L’intelligence artificielle, à votre portée
            </span>
          </div>
          <div className="row">
            <span className="topbar-pill">
              <span /> Apprendre à son rythme
            </span>
            {!user && (
              <Link href="/inscription" className="topbar-signup">
                Créer mon espace <Icon name="arrow" size={16} />
              </Link>
            )}
          </div>
        </header>
        {demo && (
          <div className="demo-banner">
            <Icon name="shield" size={15} />
            <span>
              Espace de démonstration · Offres simulées, aucun paiement réel.
            </span>
          </div>
        )}
        <main id="contenu" className="content">
          {children}
        </main>
        <footer className="footer">
          <span>Académie IA · Apprendre avec confiance.</span>
          <Link href="/a-propos">À propos de cette version</Link>
        </footer>
      </div>
    </div>
  );
}
