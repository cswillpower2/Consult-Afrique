import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const transporter = getTransporter();
  const fromEmail = process.env.SMTP_FROM || "noreply@consultafrique.com";

  await transporter.sendMail({
    from: `"ConsultAfrique" <${fromEmail}>`,
    to: email,
    subject: "Reset Your Password - ConsultAfrique",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #2F855A;">
          <h1 style="color: #2F855A; margin: 0;">ConsultAfrique</h1>
          <p style="color: #666; margin: 5px 0 0;">Education & Medical Tourism Portal</p>
        </div>
        
        <div style="padding: 30px 0;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p style="color: #555; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #2F855A; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px; line-height: 1.6;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
          
          <p style="color: #888; font-size: 12px; margin-top: 20px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #2F855A;">${resetUrl}</a>
          </p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px;">
            ConsultAfrique - Your Gateway to Education & Healthcare in Pakistan<br>
            Email: info@consultafrique.com | WhatsApp: +92 311 488 8878
          </p>
        </div>
      </div>
    `,
  });
}
