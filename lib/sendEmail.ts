import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendAdminNotification(subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: `SwapYard <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER,
      subject,
      html,
    });
  } catch (err) {
    // Never let an email failure break signup, listing creation, etc.
    console.error('Admin notification email failed:', err);
  }
}
