import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTicketSchema } from "@/lib/validation";
import { notifyUser } from "@/lib/notifications";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const assigneeId = searchParams.get("assigneeId");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (assigneeId) where.assigneeId = assigneeId;

  if (session.user.role === "CLIENT") {
    where.creatorId = session.user.id;
  }

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { creator: true, assignee: true },
  });

  return NextResponse.json({ tickets });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createTicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ticket = await prisma.ticket.create({
    data: { ...parsed.data, creatorId: session.user.id },
  });

  const agents = await prisma.user.findMany({ where: { role: "AGENT" } });
  await Promise.all(
    agents.map((agent) =>
      notifyUser({
        userId: agent.id,
        ticketId: ticket.id,
        type: "TICKET_CREATED",
        subject: `Nuevo ticket: ${ticket.title}`,
        message: `Se ha creado un nuevo ticket: ${ticket.title}`,
      })
    )
  );

  return NextResponse.json({ ticket }, { status: 201 });
}
