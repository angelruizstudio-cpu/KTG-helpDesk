"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CommentForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);

    await fetch(`/api/tickets/${ticketId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    setBody("");
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Escribe un comentario..."
        className="rounded border border-black/10 px-3 py-2 dark:border-white/15"
        rows={3}
        required
      />
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-full bg-foreground px-5 py-2 text-background disabled:opacity-50"
      >
        Comentar
      </button>
    </form>
  );
}
