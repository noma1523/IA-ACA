import { currentUser } from "@/lib/auth";
import { canEdit } from "@/lib/policy";
import { db } from "@/lib/database";
import { contentFor, threshold } from "@/lib/store";
import {
  Admin,
  type StudentRow,
  type ReportRow,
  type ModerationComment,
} from "@/components/admin";
import { Intro, Locked, Notice } from "@/components/ui";
import type { Post } from "@/lib/types";
export const metadata = { title: "Administration" };
export default async function Administration() {
  const user = await currentUser();
  if (!user || !canEdit(user.role))
    return (
      <>
        <Intro
          eyebrow="ADMINISTRATION"
          title="L’espace de l’équipe pédagogique."
        />
        <Locked
          title="Un accès éditorial est nécessaire."
          text="Seuls les éditeurs et administrateurs peuvent préparer et publier les contenus."
          loggedIn={!!user}
        />
      </>
    );
  const students =
    user.role === "admin"
      ? (db()
          .prepare(
            "SELECT u.id,u.name,u.email,u.role,s.plan,COUNT(p.completed_at) AS completed FROM users u LEFT JOIN subscriptions s ON s.user_id=u.id LEFT JOIN progress p ON p.user_id=u.id GROUP BY u.id ORDER BY u.created_at DESC LIMIT 100",
          )
          .all()
          .map((row) => ({ ...row })) as StudentRow[])
      : [];
  return (
    <>
      <Intro
        eyebrow="ADMINISTRATION"
        title="Des contenus qui font progresser."
        text="Préparez les leçons, leurs quiz et les publications du Club depuis le même espace."
      />
      <Notice title="Le programme officiel est conservé.">
        Les intitulés, l’ordre des 22 modules et les 132 leçons reprennent le
        prototype validé. Les contenus manquants restent en brouillon.
      </Notice>
      <Admin
        initial={contentFor("l001")!}
        posts={
          db()
            .prepare("SELECT * FROM posts ORDER BY created_at DESC")
            .all()
            .map((row) => ({ ...row })) as Post[]
        }
        students={students}
        reports={
          db()
            .prepare(
              "SELECT r.post_id,p.title,COUNT(*) AS count FROM reports r JOIN posts p ON p.id=r.post_id GROUP BY r.post_id",
            )
            .all()
            .map((row) => ({ ...row })) as ReportRow[]
        }
        comments={
          db()
            .prepare(
              "SELECT c.id,u.name,c.body FROM comments c JOIN users u ON u.id=c.user_id ORDER BY c.created_at DESC LIMIT 30",
            )
            .all()
            .map((row) => ({ ...row })) as ModerationComment[]
        }
        passThreshold={threshold()}
        isAdmin={user.role === "admin"}
      />
    </>
  );
}
