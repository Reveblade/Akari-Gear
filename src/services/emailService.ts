import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  auth:
    config.email.user && config.email.pass
      ? { user: config.email.user, pass: config.email.pass }
      : undefined,
});

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

  await transporter.sendMail({
    from: config.email.from,
    to,
    subject: 'Verify your email - Mousepad Store',
    html: `
      <h2>Welcome to Mousepad Store!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't create an account, you can ignore this email.</p>
    `,
  });
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

  await transporter.sendMail({
    from: config.email.from,
    to,
    subject: 'Reset your password - Mousepad Store',
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  });
}
