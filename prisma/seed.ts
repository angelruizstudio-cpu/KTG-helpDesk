import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ktg.com" },
    update: {},
    create: { name: "Admin", email: "admin@ktg.com", passwordHash, role: "ADMIN" },
  });

  const agent = await prisma.user.upsert({
    where: { email: "agent@ktg.com" },
    update: {},
    create: { name: "Agente Soporte", email: "agent@ktg.com", passwordHash, role: "AGENT" },
  });

  const client = await prisma.user.upsert({
    where: { email: "cliente@ktg.com" },
    update: {},
    create: { name: "Cliente Demo", email: "cliente@ktg.com", passwordHash, role: "CLIENT" },
  });

  await prisma.ticket.create({
    data: {
      title: "No puedo iniciar sesión",
      description: "Al intentar entrar me sale un error 500.",
      priority: "HIGH",
      type: "SUPPORT",
      creatorId: client.id,
      assigneeId: agent.id,
    },
  });

  console.log({ admin: admin.email, agent: agent.email, client: client.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
