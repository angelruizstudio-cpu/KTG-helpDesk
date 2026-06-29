import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCommentSchema } from "@/lib/validation";
import { notifyUser } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = checkRateLimit(`comment:${session.user.id}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Demasiados comentarios. Intenta más tarde." }, { status: 429 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (session.user.role === "CLIENT" && ticket.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const comment = await prisma.comment.create({
      data: { body: parsed.data.body, ticketId: id, authorId: session.user.id },
      include: { author: true },
    });

    const recipients = new Set(
      [ticket.creatorId, ticket.assigneeId].filter(
        (userId): userId is string => !!userId && userId !== session.user.id
      )
    );

    await Promise.all(
      Array.from(recipients).map((userId) =>
        notifyUser({
          userId,
          ticketId: ticket.id,
          type: "NEW_COMMENT",
          subject: `Nuevo comentario en: ${ticket.title}`,
          message: `${comment.author.name} comentó: ${comment.body}`,
        })
      )
    );

    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    console.error("Failed to create comment:", err);
    return NextResponse.json({ error: "No se pudo publicar el comentario" }, { status: 500 });
  }
}
