import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { token } = await req.json();
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Token requerido" }, { status: 400 });
  }

  try {
    const record = await prisma.verificationToken.findUnique({ where: { token } });
    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email verification failed:", err);
    return NextResponse.json({ error: "No se pudo verificar el email" }, { status: 500 });
  }
}
