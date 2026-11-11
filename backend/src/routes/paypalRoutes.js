import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { PayPalController } from '../controllers/paypalController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * Rate limiter for PayPal connection attempts.
 * Limits to 20 attempts per 15-minute window per IP.
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      authenticated: false,
      transactionSearchAvailable: false,
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    });
  },
});

// All PayPal routes require user identity
router.use(authenticateUser);

/**
 * Route: POST /api/paypal/connect
 * Validates credentials against PayPal Sandbox and optionally persists them encrypted.
 */
router.post('/connect', authRateLimiter, PayPalController.connect);

/**
 * Route: DELETE /api/paypal/disconnect
 * Disconnects PayPal Sandbox account and removes encrypted credentials.
 */
router.delete('/disconnect', PayPalController.disconnect);

export default router;
