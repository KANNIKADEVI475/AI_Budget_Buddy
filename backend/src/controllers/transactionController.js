import { Transaction, VALID_CATEGORIES } from '../models/Transaction.js';
import { PayPalConnection } from '../models/PayPalConnection.js';
import { SyncLog } from '../models/SyncLog.js';
import { PayPalTransactionService } from '../services/paypalTransactionService.js';

export class TransactionController {
  /**
   * POST /api/transactions/sync
   * Manually trigger synchronization for the currently authenticated user.
   */
  static async sync(req, res, next) {
    try {
      const userId = req.userId;

      const stats = await PayPalTransactionService.syncUserTransactions(userId);

      return res.status(200).json({
        success: true,
        message: 'PayPal Sandbox transactions synchronized successfully.',
        stats,
      });
    } catch (err) {
      if (err.message?.includes('already running')) {
        return res.status(409).json({
          success: false,
          message: err.message,
        });
      }
      if (err.message?.includes('No active PayPal')) {
        return res.status(400).json({
          success: false,
          message: 'Please connect your PayPal Sandbox account before synchronizing.',
        });
      }
      if (err.message?.includes('lacks required Transaction Search')) {
        return res.status(403).json({
          success: false,
          message: err.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: err.message || 'Failed to synchronize PayPal transactions.',
      });
    }
  }

  /**
   * GET /api/transactions
   * Return paginated, filtered transactions belonging only to the authenticated user.
   */
  static async getTransactions(req, res, next) {
    try {
      const userId = req.userId;
      const {
        page = 1,
        limit = 15,
        category,
        status,
        search,
        startDate,
        endDate,
        sort = 'desc',
      } = req.query;

      // Base query: strictly scoped to the authenticated user
      const query = { userId };

      // Category filter
      if (category && category !== 'All') {
        query.category = category;
      }

      // Status filter
      if (status && status !== 'All') {
        query.status = status;
      }

      // Date range filter
      if (startDate || endDate) {
        query.transactionDate = {};
        if (startDate) {
          query.transactionDate.$gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          query.transactionDate.$lte = end;
        }
      }

      // Search filter across merchantName or description
      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [{ merchantName: searchRegex }, { description: searchRegex }];
      }

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
      const skip = (pageNum - 1) * limitNum;
      const sortOrder = sort === 'asc' ? 1 : -1;

      const [transactions, total] = await Promise.all([
        Transaction.find(query)
          .sort({ transactionDate: sortOrder })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Transaction.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        transactions,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/transactions/stats
   * Aggregates total count, incoming, outgoing, and category breakdown for the user.
   */
  static async getStats(req, res, next) {
    try {
      const userId = req.userId;

      const [connection, latestLog, transactions] = await Promise.all([
        PayPalConnection.findOne({ userId }),
        SyncLog.findOne({ userId }).sort({ startedAt: -1 }),
        Transaction.find({ userId }).select('amount category transactionDate').lean(),
      ]);

      let totalCount = transactions.length;
      let totalIncoming = 0;
      let totalOutgoing = 0;
      const categoryMap = {};

      for (const t of transactions) {
        const amt = t.amount || 0;
        if (amt > 0) {
          totalIncoming += amt;
        } else {
          totalOutgoing += Math.abs(amt);
        }

        const cat = t.category || 'Uncategorized';
        if (!categoryMap[cat]) {
          categoryMap[cat] = { count: 0, totalAmount: 0 };
        }
        categoryMap[cat].count += 1;
        categoryMap[cat].totalAmount += Math.abs(amt);
      }

      return res.status(200).json({
        success: true,
        stats: {
          totalCount,
          totalIncoming: parseFloat(totalIncoming.toFixed(2)),
          totalOutgoing: parseFloat(totalOutgoing.toFixed(2)),
          categoryWise: categoryMap,
          lastSyncedAt: connection?.lastSyncedAt || latestLog?.completedAt || null,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/transactions/seed
   * Development helper: Populates representative Sandbox transactions into MongoDB
   * for the authenticated user to test manual categorization, filters, and isolation.
   */
  static async seedDemoTransactions(req, res, next) {
    try {
      const userId = req.userId;

      const sampleData = [
        {
          userId,
          paypalTransactionId: `SB_TX_${Date.now()}_01`,
          amount: -34.50,
          currency: 'USD',
          transactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          merchantName: 'Blue Bottle Coffee',
          transactionType: 'T0006',
          status: 'S',
          description: 'Latte & Avocado Toast',
          category: 'Uncategorized',
          categorySource: 'default',
        },
        {
          userId,
          paypalTransactionId: `SB_TX_${Date.now()}_02`,
          amount: -14.99,
          currency: 'USD',
          transactionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          merchantName: 'Spotify Premium',
          transactionType: 'T0007',
          status: 'S',
          description: 'Monthly Family Subscription',
          category: 'Uncategorized',
          categorySource: 'default',
        },
        {
          userId,
          paypalTransactionId: `SB_TX_${Date.now()}_03`,
          amount: -128.40,
          currency: 'USD',
          transactionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          merchantName: 'Target Superstore',
          transactionType: 'T0006',
          status: 'S',
          description: 'Groceries and Household Supplies',
          category: 'Uncategorized',
          categorySource: 'default',
        },
        {
          userId,
          paypalTransactionId: `SB_TX_${Date.now()}_04`,
          amount: 650.00,
          currency: 'USD',
          transactionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          merchantName: 'Acme Client Corp',
          transactionType: 'T0000',
          status: 'S',
          description: 'Freelance Web Consulting Payout',
          category: 'Income',
          categorySource: 'default',
        },
        {
          userId,
          paypalTransactionId: `SB_TX_${Date.now()}_05`,
          amount: -85.20,
          currency: 'USD',
          transactionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          merchantName: 'Pacific Gas & Electric',
          transactionType: 'T0006',
          status: 'S',
          description: 'Monthly Electricity & Gas Utility',
          category: 'Bills & Utilities',
          categorySource: 'default',
        },
      ];

      const inserted = await Transaction.insertMany(sampleData);

      return res.status(201).json({
        success: true,
        message: 'Sample Sandbox transactions seeded successfully into MongoDB.',
        count: inserted.length,
        transactions: inserted,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/transactions/:transactionId/category
   * Update category of a transaction, enforcing ownership and setting categorySource to "manual".
   */
  static async updateCategory(req, res, next) {
    try {
      const userId = req.userId;
      const { transactionId } = req.params;
      const { category } = req.body;

      if (!category || !VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
        });
      }

      // CRITICAL: Strictly verify ownership with { _id: transactionId, userId }
      const transaction = await Transaction.findOne({
        _id: transactionId,
        userId,
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found or you do not have permission to modify it.',
        });
      }

      transaction.category = category;
      transaction.categorySource = 'manual';
      await transaction.save();

      return res.status(200).json({
        success: true,
        message: 'Transaction category updated successfully.',
        transaction,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/transactions/sync-status
   * Returns current connection status, auto-sync settings, and latest sync log.
   */
  static async getSyncStatus(req, res, next) {
    try {
      const userId = req.userId;

      const [connection, latestLog] = await Promise.all([
        PayPalConnection.findOne({ userId }),
        SyncLog.findOne({ userId }).sort({ startedAt: -1 }),
      ]);

      return res.status(200).json({
        success: true,
        connectionStatus: connection ? connection.connectionStatus : 'not_connected',
        autoSyncEnabled: connection ? connection.autoSyncEnabled : false,
        lastSyncedAt: connection?.lastSyncedAt || latestLog?.completedAt || null,
        nextSyncAt: connection?.nextSyncAt || null,
        latestSyncResult: latestLog
          ? {
              status: latestLog.status,
              startedAt: latestLog.startedAt,
              completedAt: latestLog.completedAt,
              fetchedCount: latestLog.fetchedCount,
              insertedCount: latestLog.insertedCount,
              updatedCount: latestLog.updatedCount,
              errorMessage: latestLog.errorMessage,
            }
          : null,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default TransactionController;
