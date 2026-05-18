import nodemailer from 'nodemailer';

const createTransporter = async () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  console.log('[SMTP Config] Attempting to construct SMTP Transporter with values:');
  console.log(`- Host: "${host}"`);
  console.log(`- Port: ${port}`);
  console.log(`- Secure: ${secure}`);
  console.log(`- User: "${user}"`);
  console.log(`- Pass length: ${pass ? pass.length : 0} characters`);

  // If credentials are not provided, fall back to Ethereal for local development/testing.
  if (!user || !pass) {
    console.log('[SMTP Config] Credentials missing in environment variables. Falling back to Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    console.log(`[SMTP Config] Ethereal test account created: User: "${testAccount.user}"`);
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  console.log('[SMTP Config] Using real SMTP provider credentials.');
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

export const sendVerificationEmail = async (email: string, fullName: string, token: string): Promise<boolean> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

  const transporter = await createTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #E6ECF2;
          color: #0F172A;
          margin: 0;
          padding: 40px 20px;
        }
        .container {
          max-width: 560px;
          margin: 0 auto;
          background-color: rgba(255, 255, 255, 0.9);
          border: 1px solid #D6DEE8;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: 800;
          background: linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }
        .title {
          font-size: 20px;
          font-weight: 700;
          margin-top: 10px;
          color: #0F172A;
        }
        .greeting {
          font-size: 16px;
          color: #475569;
          margin-bottom: 20px;
        }
        .body-text {
          font-size: 15px;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 30px;
        }
        .btn-container {
          text-align: center;
          margin-bottom: 30px;
        }
        .btn {
          display: inline-block;
          padding: 14px 32px;
          background: #7C3AED;
          background: linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%);
          color: #ffffff !important;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
        }
        .footer {
          border-top: 1px solid #D6DEE8;
          padding-top: 20px;
          font-size: 13px;
          color: #64748B;
          text-align: center;
        }
        .link-text {
          font-size: 12px;
          word-break: break-all;
          color: #3B82F6;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo" style="font-size: 24px; font-weight: 800; color: #7C3AED;">StudyGenie AI</div>
          <div class="title">Verify your email address</div>
        </div>
        <div class="greeting">Hello ${fullName},</div>
        <div class="body-text">
          Thank you for joining StudyGenie AI! To complete your registration and unlock your personalized study dashboard, AI quiz generator, and planner, please verify your email address by clicking the button below.
        </div>
        <div class="btn-container">
          <a href="${verificationLink}" class="btn" style="color: #ffffff;">Verify Email Address</a>
        </div>
        <div class="body-text">
          If the button doesn't work, you can also copy and paste the link below into your web browser:
          <div class="link-text">${verificationLink}</div>
        </div>
        <div class="footer">
          This link will expire in 24 hours. If you did not sign up for a StudyGenie AI account, you can safely ignore this email.
        </div>
      </div>
    </body>
    </html>
  `;

  console.log(`[SMTP] Attempting to send verification email to: "${email}"`);
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'StudyGenie AI'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'no-reply@studygenie.ai'}>`,
      to: email,
      subject: 'Verify your email - StudyGenie AI',
      html: htmlContent,
    });

    console.log(`[SMTP] Verification email successfully sent to: "${email}"`);
    console.log(`- MessageID: ${info.messageId}`);
    console.log(`- SMTP Response: "${info.response}"`);

    // If using Ethereal, log preview URL to console for developer convenience
    const testUrl = nodemailer.getTestMessageUrl(info);
    if (testUrl) console.log('Preview email URL:', testUrl);

    return true;
  } catch (error) {
    console.error(`[SMTP] Failed to send verification email to "${email}":`, error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email: string, fullName: string, token: string): Promise<boolean> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  const transporter = await createTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #E6ECF2;
          color: #0F172A;
          margin: 0;
          padding: 40px 20px;
        }
        .container {
          max-width: 560px;
          margin: 0 auto;
          background-color: rgba(255, 255, 255, 0.9);
          border: 1px solid #D6DEE8;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: 800;
          background: linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }
        .title {
          font-size: 20px;
          font-weight: 700;
          margin-top: 10px;
          color: #0F172A;
        }
        .greeting {
          font-size: 16px;
          color: #475569;
          margin-bottom: 20px;
        }
        .body-text {
          font-size: 15px;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 30px;
        }
        .btn-container {
          text-align: center;
          margin-bottom: 30px;
        }
        .btn {
          display: inline-block;
          padding: 14px 32px;
          background: #7C3AED;
          background: linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%);
          color: #ffffff !important;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
        }
        .footer {
          border-top: 1px solid #D6DEE8;
          padding-top: 20px;
          font-size: 13px;
          color: #64748B;
          text-align: center;
        }
        .link-text {
          font-size: 12px;
          word-break: break-all;
          color: #3B82F6;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo" style="font-size: 24px; font-weight: 800; color: #7C3AED;">StudyGenie AI</div>
          <div class="title">Reset your password</div>
        </div>
        <div class="greeting">Hello ${fullName},</div>
        <div class="body-text">
          We received a request to reset the password for your StudyGenie AI account. Click the button below to choose a new password.
        </div>
        <div class="btn-container">
          <a href="${resetLink}" class="btn" style="color: #ffffff;">Reset Password</a>
        </div>
        <div class="body-text">
          If you did not request a password reset, you can safely ignore this email. Alternatively, you can copy the link below:
          <div class="link-text">${resetLink}</div>
        </div>
        <div class="footer">
          This link will expire in 1 hour.
        </div>
      </div>
    </body>
    </html>
  `;

  console.log(`[SMTP] Attempting to send password reset email to: "${email}"`);
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'StudyGenie AI'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'no-reply@studygenie.ai'}>`,
      to: email,
      subject: 'Reset your password - StudyGenie AI',
      html: htmlContent,
    });

    console.log(`[SMTP] Password reset email successfully sent to: "${email}"`);
    console.log(`- MessageID: ${info.messageId}`);
    console.log(`- SMTP Response: "${info.response}"`);

    const testUrl = nodemailer.getTestMessageUrl(info);
    if (testUrl) console.log('Preview email URL:', testUrl);

    return true;
  } catch (error) {
    console.error(`[SMTP] Failed to send password reset email to "${email}":`, error);
    throw error;
  }
};
