import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import type { NotificationType } from "@prisma/client";

export async function notifyUser(params: {
  userId: string;
  ticketId: string;
  type: NotificationType;
  subject: string;
  message: string;
}) {
  const { userId, ticketId, type, subject, message } = params;

  await prisma.notification.create({
    data: { userId, ticketId, type },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    await sendNotificationEmail(user.email, subject, message);
  }
}
