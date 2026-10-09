import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import {
  registerValidator,
  loginValidator,
  verifyEmailValidator,
  resendVerificationValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verify2FAValidator,
  resend2FAValidator,
} from '../validators/authValidators.js';

const router = Router();

router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);
router.post('/verify-email', verifyEmailValidator, authController.verifyEmail);
router.post(
  '/resend-verification',
  resendVerificationValidator,
  authController.resendVerification
);
router.post(
  '/forgot-password',
  forgotPasswordValidator,
  authController.forgotPassword
);
router.post(
  '/reset-password',
  resetPasswordValidator,
  authController.resetPassword
);

router.post('/verify-2fa', verify2FAValidator, authController.verify2FA);
router.post('/resend-2fa', resend2FAValidator, authController.resend2FACode);

router.get('/me', authenticate, authController.getMe);
router.post('/enable-2fa', authenticate, authController.enable2FA);
router.post('/disable-2fa', authenticate, authController.disable2FA);

export default router;
