import { PayPalConnection } from '../models/PayPalConnection.js';
import { PayPalTransactionService } from './paypalTransactionService.js';

/**
 * Service to orchestrate batch transaction synchronization for all active users.
 */
export class TransactionSyncService {
  /**
   * Synchronizes all connected accounts that have autoSyncEnabled = true.
   * Catches errors per user to prevent one user's failure from blocking others.
   */
  static async syncAllActiveUsers() {
    console.log('[TransactionSyncService] Starting scheduled auto-sync batch...');

    const activeConnections = await PayPalConnection.find({
      connectionStatus: 'connected',
      autoSyncEnabled: true,
    });

    console.log(`[TransactionSyncService] Found ${activeConnections.length} user(s) with auto-sync enabled.`);

    const results = {
      total: activeConnections.length,
      successCount: 0,
      failedCount: 0,
      errors: [],
    };

    for (const conn of activeConnections) {
      try {
        console.log(`[TransactionSyncService] Syncing user: ${conn.userId}...`);
        const stats = await PayPalTransactionService.syncUserTransactions(conn.userId);
        results.successCount++;
        console.log(
          `[TransactionSyncService] User ${conn.userId} sync complete. Fetched: ${stats.fetchedCount}, Inserted: ${stats.insertedCount}, Updated: ${stats.updatedCount}`
        );
      } catch (err) {
        results.failedCount++;
        results.errors.push({ userId: conn.userId, error: err.message });
        console.error(`[TransactionSyncService] Failed to sync user ${conn.userId}: ${err.message}`);
      }
    }

    console.log(
      `[TransactionSyncService] Batch completed. Successful: ${results.successCount}, Failed: ${results.failedCount}`
    );
    return results;
  }
}

export default TransactionSyncService;
