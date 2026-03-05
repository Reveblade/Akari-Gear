import { Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { User, IUser } from '../models/User.js';
import { PendingRegistration } from '../models/PendingRegistration.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  send2FALinkEmail,
} from '../services/emailService.js';
import { AuthRequest } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

function generateToken(user: IUser): string {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresInSeconds }
  );
}

export async function register(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const existingPending = await PendingRegistration.findOne({ email });
    if (existingPending) {
      await PendingRegistration.deleteOne({ email });
    }

    const verificationToken = uuidv4();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 12);
    await PendingRegistration.create({
      email,
      password: hashedPassword,
      token: verificationToken,
      expires,
    });

    await sendVerificationEmail({
      to: email,
      token: verificationToken,
      isAdmin: false,
    });

    res.status(201).json({
      message: 'E-postanıza doğrulama linki gönderildi. Hesabınız linke tıkladığınızda oluşturulacak.',
      email,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: AuthRequest, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (user.twoFactorEnabled) {
      const twoFactorToken = uuidv4();
      user.twoFactorCode = twoFactorToken;
      user.twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await send2FALinkEmail({
        to: user.email,
        token: twoFactorToken,
      });

      res.json({
        requiresTwoFactor: true,
        email: user.email,
        message: 'Verification link sent to your email',
      });
      return;
    }

    const token = generateToken(user);
    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function verifyEmail(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { token } = req.body;

    const pending = await PendingRegistration.findOne({
      token,
      expires: { $gt: new Date() },
    });

    if (pending) {
      const user = await User.create({
        email: pending.email,
        password: pending.password,
        emailVerified: true,
      });
      await PendingRegistration.deleteOne({ _id: pending._id });
      const authToken = generateToken(user);
      res.json({
        message: 'Email verified successfully',
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        token: authToken,
      });
      return;
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired verification token' });
      return;
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const authToken = generateToken(user);
    res.json({
      message: 'Email verified successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      token: authToken,
    });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
}

export async function resendVerification(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      if (user.emailVerified) {
        res.status(400).json({ error: 'Email already verified' });
        return;
      }
    }

    const pending = await PendingRegistration.findOne({ email });
    if (!pending && !user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const verificationToken = uuidv4();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (pending) {
      pending.token = verificationToken;
      pending.expires = expires;
      await pending.save();
    } else if (user) {
      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = expires;
      await user.save({ validateBeforeSave: false });
    }

    await sendVerificationEmail({
      to: email,
      token: verificationToken,
      isAdmin: false,
    });

    res.json({ message: 'Verification email sent' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
}

export async function forgotPassword(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(200).json({ message: 'If the email exists, a reset link was sent' });
      return;
    }

    const resetToken = uuidv4();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail({
      to: user.email,
      token: resetToken,
      isAdmin: false,
    });

    res.json({ message: 'If the email exists, a reset link was sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
}

export async function resetPassword(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+password');

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const authToken = generateToken(user);
    res.json({
      message: 'Password reset successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      token: authToken,
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Password reset failed' });
  }
}

export async function verify2FA(req: AuthRequest, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { token } = req.body;

    const user = await User.findOne({
      twoFactorCode: token,
      twoFactorExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired verification link' });
      return;
    }

    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    await user.save();

    const authToken = generateToken(user);
    res.json({
      message: '2FA verified successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      token: authToken,
    });
  } catch (err) {
    console.error('Verify 2FA error:', err);
    res.status(500).json({ error: '2FA verification failed' });
  }
}

export async function resend2FACode(req: AuthRequest, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!user.twoFactorEnabled) {
      res.status(400).json({ error: '2FA is not enabled for this account' });
      return;
    }

    const twoFactorToken = uuidv4();
    user.twoFactorCode = twoFactorToken;
    user.twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await send2FALinkEmail({
      to: user.email,
      token: twoFactorToken,
    });

    res.json({ message: 'Verification link resent to your email' });
  } catch (err) {
    console.error('Resend 2FA code error:', err);
    res.status(500).json({ error: 'Failed to resend verification code' });
  }
}

export async function enable2FA(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.twoFactorEnabled) {
      res.status(400).json({ error: '2FA is already enabled' });
      return;
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({
      message: '2FA enabled successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (err) {
    console.error('Enable 2FA error:', err);
    res.status(500).json({ error: 'Failed to enable 2FA' });
  }
}

export async function disable2FA(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!user.twoFactorEnabled) {
      res.status(400).json({ error: '2FA is not enabled' });
      return;
    }

    user.twoFactorEnabled = false;
    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    await user.save();

    res.json({
      message: '2FA disabled successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (err) {
    console.error('Disable 2FA error:', err);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user._id);
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        emailVerified: req.user.emailVerified,
        twoFactorEnabled: user?.twoFactorEnabled ?? false,
      },
    });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
}
