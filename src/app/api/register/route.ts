import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { createVerificationToken, sendVerificationEmail } from "@/lib/tokens";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const { allowed } = checkRateLimit(`register:${getClientIp(req)}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
  }

  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "CLIENT" },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = await createVerificationToken(user.id);
    await sendVerificationEmail(email, name, token);

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("Registration failed:", err);
    return NextResponse.json({ error: "No se pudo completar el registro" }, { status: 500 });
  }
}
