"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "AGENT" | "CLIENT";
  emailVerified: string | null;
  createdAt: string;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "AGENT">("AGENT");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadUsers(p: number) {
    const res = await fetch(`/api/users?page=${p}`);
    if (!res.ok) return;
    const data = await res.json();
    setUsers(data.users);
    setTotal(data.total);
    setPage(data.page);
  }

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "ADMIN") {
      router.replace("/tickets");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUsers(1);
  }, [status, session, router]);

  if (status === "loading" || !session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error?.formErrors?.[0] ?? data?.error ?? "No se pudo invitar al usuario");
      return;
    }

    setSuccess("Invitación enviada correctamente.");
    setName("");
    setEmail("");
    setRole("AGENT");
    loadUsers(page);
  }

  async function handleRoleChange(id: string, newRole: string) {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      loadUsers(page);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-1 flex-col gap-8 p-8">
      <h1 className="text-2xl font-semibold">Usuarios</h1>

      <form onSubmit={handleInvite} className="flex flex-col gap-3 rounded border border-black/10 p-4 dark:border-white/15">
        <h2 className="font-medium">Invitar usuario</h2>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
        <div className="flex gap-3">
          <input
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded border border-black/10 px-3 py-2 dark:border-white/15"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded border border-black/10 px-3 py-2 dark:border-white/15"
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "ADMIN" | "AGENT")}
            className="rounded border border-black/10 px-3 py-2 dark:border-white/15"
          >
            <option value="AGENT">Agente</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit" className="rounded-full bg-foreground px-5 py-2 text-background">
            Invitar
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between rounded border border-black/10 p-4 dark:border-white/15"
          >
            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-zinc-500">{u.email}</p>
            </div>
            <select
              value={u.role}
              onChange={(e) => handleRoleChange(u.id, e.target.value)}
              className="rounded border border-black/10 px-3 py-2 dark:border-white/15"
            >
              <option value="CLIENT">Cliente</option>
              <option value="AGENT">Agente</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            disabled={page <= 1}
            onClick={() => loadUsers(page - 1)}
            className="rounded-full border border-black/10 px-4 py-1 disabled:opacity-40 dark:border-white/15"
          >
            Anterior
          </button>
          <span className="text-sm text-zinc-500">
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => loadUsers(page + 1)}
            className="rounded-full border border-black/10 px-4 py-1 disabled:opacity-40 dark:border-white/15"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
