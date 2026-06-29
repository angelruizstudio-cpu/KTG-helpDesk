import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendEmail(to: string, subject: string, text: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set, skipping email send:", subject);
    return;
  }

  try {
    await resend.emails.send({
      from: env.EMAIL_FROM ?? "notifications@example.com",
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}
