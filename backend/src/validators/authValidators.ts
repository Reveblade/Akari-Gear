import { body } from 'express-validator';

export const registerValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must contain a letter'),
];

export const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const verifyEmailValidator = [
  body('token').notEmpty().withMessage('Verification token is required'),
];

export const resendVerificationValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

export const forgotPasswordValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

export const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must contain a letter'),
];

export const verify2FAValidator = [
  body('token').notEmpty().withMessage('Verification token is required'),
];

export const resend2FAValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];
