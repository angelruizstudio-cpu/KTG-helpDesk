"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Ticket = {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  creator: { name: string };
  assignee: { name: string } | null;
};

export default function TicketsPage() {
  const router = useRouter();
  const { status: sessionStatus } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace("/login");
    },
  });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  async function load(p: number) {
    const params = new URLSearchParams({ page: String(p) });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);

    const res = await fetch(`/api/tickets?${params.toString()}`);
    if (!res.ok) return;
    const data = await res.json();
    setTickets(data.tickets);
    setTotal(data.total);
    setPage(data.page);
  }

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(1);
  }, [sessionStatus, search, status, priority]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (sessionStatus !== "authenticated") {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <Link href="/tickets/new" className="rounded-full bg-foreground px-5 py-2 text-background">
          Nuevo ticket
        </Link>
      </div>

      <div className="flex gap-3">
        <input
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded border border-black/10 px-3 py-2 dark:border-white/15"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border border-black/10 px-3 py-2 dark:border-white/15"
        >
          <option value="">Todos los estados</option>
          <option value="OPEN">Abierto</option>
          <option value="IN_PROGRESS">En progreso</option>
          <option value="RESOLVED">Resuelto</option>
          <option value="CLOSED">Cerrado</option>
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded border border-black/10 px-3 py-2 dark:border-white/15"
        >
          <option value="">Toda prioridad</option>
          <option value="LOW">Baja</option>
          <option value="MEDIUM">Media</option>
          <option value="HIGH">Alta</option>
          <option value="URGENT">Urgente</option>
        </select>
      </div>

      <div className="flex flex-col gap-3">
        {tickets.length === 0 && <p className="text-zinc-500">No hay tickets todavía.</p>}
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/tickets/${ticket.id}`}
            className="flex items-center justify-between rounded border border-black/10 p-4 hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.03]"
          >
            <div>
              <p className="font-medium">{ticket.title}</p>
              <p className="text-sm text-zinc-500">
                {ticket.creator.name} · {ticket.type} · {ticket.priority}
              </p>
            </div>
            <span className="rounded-full bg-black/5 px-3 py-1 text-sm dark:bg-white/10">
              {ticket.status}
            </span>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            disabled={page <= 1}
            onClick={() => load(page - 1)}
            className="rounded-full border border-black/10 px-4 py-1 disabled:opacity-40 dark:border-white/15"
          >
            Anterior
          </button>
          <span className="text-sm text-zinc-500">
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => load(page + 1)}
            className="rounded-full border border-black/10 px-4 py-1 disabled:opacity-40 dark:border-white/15"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
