import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  // If Resend is not configured, log to console (development mode)
  if (!resend) {
    console.log("📧 Email would be sent:");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("From:", from || process.env.FROM_EMAIL || "noreply@pazaryonetimi.com");
    console.log("---");
    return { success: true, id: "dev-mode" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: from || process.env.FROM_EMAIL || "noreply@pazaryonetimi.com",
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error("Failed to send email:", error);
      throw error;
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
}
