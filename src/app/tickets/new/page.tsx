"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTicketPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [type, setType] = useState("SUPPORT");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, priority, type }),
    });

    if (!res.ok) {
      setError("No se pudo crear el ticket");
      return;
    }

    const { ticket } = await res.json();
    router.push(`/tickets/${ticket.id}`);
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <form onSubmit={handleSubmit} className="flex w-full max-w-lg flex-col gap-4 p-6">
        <h1 className="text-2xl font-semibold">Nuevo ticket</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded border border-black/10 px-3 py-2 dark:border-white/15"
          required
        />
        <textarea
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded border border-black/10 px-3 py-2 dark:border-white/15"
          rows={5}
          required
        />
        <div className="flex gap-4">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="flex-1 rounded border border-black/10 px-3 py-2 dark:border-white/15"
          >
            <option value="SUPPORT">Soporte</option>
            <option value="TASK">Tarea</option>
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="flex-1 rounded border border-black/10 px-3 py-2 dark:border-white/15"
          >
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>
        </div>
        <button type="submit" className="rounded-full bg-foreground px-5 py-3 text-background">
          Crear ticket
        </button>
      </form>
    </div>
  );
}
