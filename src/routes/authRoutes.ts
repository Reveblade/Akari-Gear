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

router.get('/me', authenticate, authController.getMe);

export default router;
