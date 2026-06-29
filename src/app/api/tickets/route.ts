import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTicketSchema } from "@/lib/validation";
import { notifyUser } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assigneeId = searchParams.get("assigneeId");
    const search = searchParams.get("search");
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = 20;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (search) where.title = { contains: search, mode: "insensitive" };

    if (session.user.role === "CLIENT") {
      where.creatorId = session.user.id;
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { creator: true, assignee: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.ticket.count({ where }),
    ]);

    return NextResponse.json({ tickets, total, page, pageSize });
  } catch (err) {
    console.error("Failed to list tickets:", err);
    return NextResponse.json({ error: "No se pudieron cargar los tickets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = checkRateLimit(`create-ticket:${session.user.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Demasiados tickets creados. Intenta más tarde." }, { status: 429 });
  }

  const body = await req.json();
  const parsed = createTicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
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
  } catch (err) {
    console.error("Failed to create ticket:", err);
    return NextResponse.json({ error: "No se pudo crear el ticket" }, { status: 500 });
  }
}
