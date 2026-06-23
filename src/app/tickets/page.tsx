import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TicketsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const where = session.user.role === "CLIENT" ? { creatorId: session.user.id } : {};

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { creator: true, assignee: true },
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <Link href="/tickets/new" className="rounded-full bg-foreground px-5 py-2 text-background">
          Nuevo ticket
        </Link>
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
    </div>
  );
}
