import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken, sendPasswordResetEmail } from "@/lib/tokens";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const { allowed } = checkRateLimit(`pwreset:${getClientIp(req)}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (user) {
      const token = await createPasswordResetToken(user.id);
      await sendPasswordResetEmail(user.email, user.name, token);
    }

    // Always return success to avoid leaking which emails are registered.
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Password reset request failed:", err);
    return NextResponse.json({ error: "No se pudo procesar la solicitud" }, { status: 500 });
  }
}
