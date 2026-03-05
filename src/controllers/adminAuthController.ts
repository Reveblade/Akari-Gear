import { Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { User } from '../models/User.js';
import { sendVerificationEmail } from '../services/emailService.js';
import { AuthRequest } from '../middleware/auth.js';

/**
 * Create a new admin user. Only existing admins can call this.
 */
export async function createAdmin(
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
      role: 'admin',
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await sendVerificationEmail({
      to: user.email,
      token: verificationToken,
      isAdmin: true,
    });

    res.status(201).json({
      message: 'Admin created. Verification email sent.',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ error: 'Failed to create admin' });
  }
}
