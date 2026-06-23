import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendNotificationEmail(to: string, subject: string, text: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set, skipping email send:", subject);
    return;
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "notifications@example.com",
    to,
    subject,
    text,
  });
}
