import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { TransactionController } from '../controllers/transactionController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

// Rate limiter for manual transaction synchronization (max 10 sync triggers per 5 minutes)
const syncRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Manual sync rate limit reached. Please wait a few minutes before synchronizing again.',
  },
});

// Protect all transaction routes with authentication
router.use(authenticateUser);

/**
 * Route: POST /api/transactions/seed
 * Seed sample transactions for development testing.
 */
router.post('/seed', TransactionController.seedDemoTransactions);

/**
 * Route: POST /api/transactions/sync
 * Manually trigger PayPal Sandbox transaction synchronization.
 */
router.post('/sync', syncRateLimiter, TransactionController.sync);

/**
 * Route: GET /api/transactions
 * Retrieve paginated, filtered transaction history for the authenticated user.
 */
router.get('/', TransactionController.getTransactions);

/**
 * Route: GET /api/transactions/stats
 * Retrieve aggregated statistics and category breakdown.
 */
router.get('/stats', TransactionController.getStats);

/**
 * Route: GET /api/transactions/sync-status
 * Retrieve active sync status and last sync log.
 */
router.get('/sync-status', TransactionController.getSyncStatus);

/**
 * Route: PATCH /api/transactions/:transactionId/category
 * Manually update the category of a transaction.
 */
router.patch('/:transactionId/category', TransactionController.updateCategory);

export default router;
