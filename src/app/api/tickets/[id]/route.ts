import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTicketSchema } from "@/lib/validation";
import { notifyUser } from "@/lib/notifications";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.user.role === "CLIENT" && ticket.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ ticket });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role === "CLIENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateTicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.ticket.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data: parsed.data,
  });

  if (parsed.data.assigneeId && parsed.data.assigneeId !== existing.assigneeId) {
    await notifyUser({
      userId: parsed.data.assigneeId,
      ticketId: ticket.id,
      type: "TICKET_ASSIGNED",
      subject: `Te asignaron el ticket: ${ticket.title}`,
      message: `Se te ha asignado el ticket: ${ticket.title}`,
    });
  }

  if (parsed.data.status && parsed.data.status !== existing.status) {
    await notifyUser({
      userId: existing.creatorId,
      ticketId: ticket.id,
      type: "TICKET_STATUS_CHANGED",
      subject: `Tu ticket cambió de estado: ${ticket.title}`,
      message: `El ticket "${ticket.title}" ahora está en estado ${ticket.status}.`,
    });
  }

  return NextResponse.json({ ticket });
}
