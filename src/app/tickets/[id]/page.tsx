import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CommentForm } from "@/components/comment-form";
import { TicketStatusControl } from "@/components/ticket-status-control";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      creator: true,
      assignee: true,
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!ticket) {
    notFound();
  }

  if (session.user.role === "CLIENT" && ticket.creatorId !== session.user.id) {
    notFound();
  }

  const canManage = session.user.role !== "CLIENT";

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{ticket.title}</h1>
          <p className="text-sm text-zinc-500">
            Creado por {ticket.creator.name} · {ticket.type} · {ticket.priority}
          </p>
        </div>
        {canManage ? (
          <TicketStatusControl ticketId={ticket.id} status={ticket.status} />
        ) : (
          <span className="rounded-full bg-black/5 px-3 py-1 text-sm dark:bg-white/10">
            {ticket.status}
          </span>
        )}
      </div>

      <p className="whitespace-pre-wrap rounded border border-black/10 p-4 dark:border-white/15">
        {ticket.description}
      </p>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Comentarios</h2>
        {ticket.comments.map((comment) => (
          <div key={comment.id} className="rounded border border-black/10 p-3 dark:border-white/15">
            <p className="text-sm font-medium">{comment.author.name}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{comment.body}</p>
          </div>
        ))}
        <CommentForm ticketId={ticket.id} />
      </div>
    </div>
  );
}
