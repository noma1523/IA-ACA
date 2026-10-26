"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { post } from "@/lib/client";
export function ExpireDemo() {
  const router = useRouter(),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  return (
    <>
      <button
        disabled={pending}
        className="button secondary"
        onClick={async () => {
          setPending(true);
          try {
            await post("/api/demo", { action: "expire" });
            router.refresh();
          } catch (error) {
            setError((error as Error).message);
          } finally {
            setPending(false);
          }
        }}
      >
        Simuler l’expiration de mon accès
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
