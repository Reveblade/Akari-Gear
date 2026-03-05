import { Resend } from 'resend';
import { config } from '../config/index.js';

const resend = config.email.resendApiKey ? new Resend(config.email.resendApiKey) : null;

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  debugInfo?: string
): Promise<void> {
  if (!resend) {
    console.warn('Resend API key not configured. Email not sent:', { to, subject });
    return;
  }

  const { error } = await resend.emails.send({
    from: config.email.from,
    to,
    subject,
    html,
  });

  if (error) {
    const errMsg = `Resend error: ${error.message}`;
    if (
      config.env === 'development' &&
      error.message?.includes('You can only send testing emails')
    ) {
      console.warn('[DEV] Resend test limit - email not sent to', to);
      if (debugInfo) console.warn('[DEV] Use this link/code:', debugInfo);
      return;
    }
    throw new Error(errMsg);
  }
}

export interface SendVerificationEmailParams {
  to: string;
  token: string;
  isAdmin?: boolean;
}

export async function sendVerificationEmail({
  to,
  token,
  isAdmin = false,
}: SendVerificationEmailParams): Promise<void> {
  const baseUrl = isAdmin ? config.urls.admin : config.urls.frontend;
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

  await sendEmail(
    to,
    'Verify your email - Akari Gear',
    `
      <h2>Welcome to Akari Gear!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't create an account, you can ignore this email.</p>
    `,
    verifyUrl
  );
}

export interface SendPasswordResetEmailParams {
  to: string;
  token: string;
  isAdmin?: boolean;
}

export async function sendPasswordResetEmail({
  to,
  token,
  isAdmin = false,
}: SendPasswordResetEmailParams): Promise<void> {
  const baseUrl = isAdmin ? config.urls.admin : config.urls.frontend;
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  await sendEmail(
    to,
    'Reset your password - Akari Gear',
    `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
    resetUrl
  );
}

export interface Send2FALinkEmailParams {
  to: string;
  token: string;
}

export async function send2FALinkEmail({ to, token }: Send2FALinkEmailParams): Promise<void> {
  const verifyUrl = `${config.urls.frontend}/verify-2fa?token=${token}`;

  await sendEmail(
    to,
    'Your login verification link - Akari Gear',
    `
      <h2>Complete your login</h2>
      <p>Click the link below to complete your login:</p>
      <p><a href="${verifyUrl}">Verify and sign in</a></p>
      <p>This link expires in 10 minutes.</p>
      <p>If you didn't request this, please secure your account immediately.</p>
    `,
    verifyUrl
  );
}
