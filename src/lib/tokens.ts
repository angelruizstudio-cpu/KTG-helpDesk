import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

export async function createVerificationToken(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: { token, userId, expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS) },
  });
  return token;
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const url = `${env.NEXTAUTH_URL}/verify-email?token=${token}`;
  await sendEmail(
    email,
    "Verifica tu cuenta en KTG Ticket System",
    `Hola ${name}, confirma tu cuenta visitando: ${url}\n\nEste enlace expira en 24 horas.`
  );
}

export async function createPasswordResetToken(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: { token, userId, expiresAt: new Date(Date.now() + RESET_TTL_MS) },
  });
  return token;
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const url = `${env.NEXTAUTH_URL}/reset-password?token=${token}`;
  await sendEmail(
    email,
    "Restablece tu contraseña",
    `Hola ${name}, restablece tu contraseña visitando: ${url}\n\nEste enlace expira en 1 hora. Si no lo solicitaste, ignora este mensaje.`
  );
}

export async function sendInviteEmail(email: string, name: string, token: string) {
  const url = `${env.NEXTAUTH_URL}/reset-password?token=${token}`;
  await sendEmail(
    email,
    "Te invitaron a KTG Ticket System",
    `Hola ${name}, fuiste agregado al equipo. Define tu contraseña visitando: ${url}\n\nEste enlace expira en 1 hora.`
  );
}
