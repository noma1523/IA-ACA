import type { Metadata } from "next";
import { currentUser } from "@/lib/auth";
import { isDemo } from "@/lib/policy";
import { Shell } from "@/components/shell";
import "./globals.css";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: {
    default: "Académie IA — Votre prochaine étape commence ici",
    template: "%s · Académie IA",
  },
  description:
    "Comprendre et utiliser l’intelligence artificielle, pas à pas. 22 modules et 132 leçons pour apprendre à votre rythme.",
};
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body>
        <Shell user={await currentUser()} demo={isDemo()}>
          {children}
        </Shell>
      </body>
    </html>
  );
}
