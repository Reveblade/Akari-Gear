import { Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { User, IUser } from '../models/User.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { AuthRequest } from '../middleware/auth.js';

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

    const verificationToken = uuidv4();
    const user = await User.create({
      email,
      password,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await sendVerificationEmail({
      to: user.email,
      token: verificationToken,
      isAdmin: false,
    });

    const token = generateToken(user);
    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      token,
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
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ error: 'Email already verified' });
      return;
    }

    const verificationToken = uuidv4();
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail({
      to: user.email,
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

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        emailVerified: req.user.emailVerified,
      },
    });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
}
