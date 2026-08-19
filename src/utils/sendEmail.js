import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

// Fire-and-forget: never let a failed email block an API response.
export async function sendAdminNotification(subject, html) {
  if (!process.env.SMTP_USER || !process.env.ADMIN_NOTIFY_EMAIL) {
    console.log('[email] SMTP not configured — skipping notification:', subject);
    return;
  }
  try {
    await getTransporter().sendMail({
      from: `"FitStitch Boutique" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_NOTIFY_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    console.error('[email] Failed to send notification:', err.message);
  }
}
