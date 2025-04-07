import { Router } from 'express';
import { register, login, resetPassword, requestPasswordReset, verifyOtp, resendOtp } from '../controllers/authController';

const router = Router();
router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;  