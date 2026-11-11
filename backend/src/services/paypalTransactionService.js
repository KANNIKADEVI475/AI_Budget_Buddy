import axios from 'axios';
import { PAYPAL_CONFIG } from '../config/paypal.js';
import { PayPalAuthService } from './paypalAuthService.js';
import { decryptCredential } from './encryptionService.js';
import { PayPalConnection } from '../models/PayPalConnection.js';
import { Transaction } from '../models/Transaction.js';
import { SyncLog } from '../models/SyncLog.js';

// In-memory concurrency lock to prevent duplicate concurrent synchronizations per user
const activeSyncLocks = new Set();

export class PayPalTransactionService {
  /**
   * Synchronizes PayPal Sandbox transactions for a given user.
   *
   * @param {string} userId - Application user ID
   * @param {object} options - Optional { startDate, endDate, forceSync }
   * @returns {Promise<{
   *   status: 'success' | 'failed',
   *   fetchedCount: number,
   *   insertedCount: number,
   *   updatedCount: number,
   *   startedAt: Date,
   *   completedAt: Date,
   *   errorMessage?: string
   * }>}
   */
  static async syncUserTransactions(userId, options = {}) {
    if (!userId) {
      throw new Error('userId is required for transaction synchronization');
    }

    // 1. Concurrency Lock check
    if (activeSyncLocks.has(userId)) {
      throw new Error('A synchronization job is already running for this user. Please wait.');
    }
    activeSyncLocks.add(userId);

    const startedAt = new Date();
    let syncLog = null;

    try {
      // 2. Initialize SyncLog record
      syncLog = await SyncLog.create({
        userId,
        startedAt,
        status: 'failed', // updated to 'success' upon completion
      });

      // 3. Load active PayPal connection
      const connection = await PayPalConnection.findOne({
        userId,
        connectionStatus: 'connected',
      });

      if (!connection) {
        throw new Error('No active PayPal Sandbox connection found for this user.');
      }

      // 4. Decrypt client secret
      let clientSecret;
      try {
        clientSecret = decryptCredential(connection.encryptedClientSecret);
      } catch (err) {
        throw new Error('Failed to decrypt stored credentials. Key mismatch or corrupt storage.');
      }

      // 5. Generate fresh ephemeral access token and check reporting scope
      const accessToken = await PayPalAuthService.getAccessToken(connection.clientId, clientSecret);

      // 6. Compute date range (RFC3339)
      const { startIso, endIso } = this.calculateDateRange(connection.lastSyncedAt, options);

      // 7. Fetch all transaction records across pages
      const rawTransactions = await this.fetchAllTransactions(accessToken, startIso, endIso);

      // 8. Normalize & Upsert into MongoDB preserving manual categories
      let insertedCount = 0;
      let updatedCount = 0;

      for (const rawItem of rawTransactions) {
        const normalized = this.normalizeTransaction(rawItem, userId);
        if (!normalized || !normalized.paypalTransactionId) continue;

        const existing = await Transaction.findOne({
          userId,
          paypalTransactionId: normalized.paypalTransactionId,
        });

        if (existing) {
          // Preserve manual category and source if user has customized it
          await Transaction.updateOne(
            { _id: existing._id },
            {
              $set: {
                amount: normalized.amount,
                currency: normalized.currency,
                transactionDate: normalized.transactionDate,
                merchantName: normalized.merchantName,
                transactionType: normalized.transactionType,
                status: normalized.status,
                description: normalized.description,
                source: 'paypal_sandbox',
              },
            }
          );
          updatedCount++;
        } else {
          await Transaction.create({
            ...normalized,
            category: 'Uncategorized',
            categorySource: 'default',
            source: 'paypal_sandbox',
          });
          insertedCount++;
        }
      }

      const completedAt = new Date();

      // 9. Update connection sync timestamps
      const nextSync = new Date();
      nextSync.setDate(nextSync.getDate() + 1);
      nextSync.setHours(2, 0, 0, 0); // Next 2:00 AM

      connection.lastSyncedAt = completedAt;
      connection.nextSyncAt = connection.autoSyncEnabled ? nextSync : null;
      await connection.save();

      // 10. Update SyncLog record
      syncLog.status = 'success';
      syncLog.completedAt = completedAt;
      syncLog.fetchedCount = rawTransactions.length;
      syncLog.insertedCount = insertedCount;
      syncLog.updatedCount = updatedCount;
      await syncLog.save();

      return {
        status: 'success',
        fetchedCount: rawTransactions.length,
        insertedCount,
        updatedCount,
        startedAt,
        completedAt,
      };
    } catch (err) {
      const completedAt = new Date();
      if (syncLog) {
        syncLog.status = 'failed';
        syncLog.completedAt = completedAt;
        syncLog.errorMessage = err.message || 'Unknown synchronization error';
        await syncLog.save().catch(() => {});
      }
      throw err;
    } finally {
      // Release lock
      activeSyncLocks.delete(userId);
    }
  }

  /**
   * Fetches all pages of transactions from PayPal Transaction Search API v1.
   */
  static async fetchAllTransactions(accessToken, startIso, endIso) {
    const allRecords = [];
    let currentPage = 1;
    let totalPages = 1;
    const pageSize = 100;

    do {
      try {
        const response = await axios.get(PAYPAL_CONFIG.TRANSACTIONS_URL, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          params: {
            start_date: startIso,
            end_date: endIso,
            page_size: pageSize,
            page: currentPage,
            fields: 'transaction_info,payer_info',
          },
          timeout: PAYPAL_CONFIG.REQUEST_TIMEOUT_MS,
        });

        const data = response.data || {};
        const details = data.transaction_details || [];
        allRecords.push(...details);

        totalPages = data.total_pages || 1;
        currentPage++;
      } catch (err) {
        if (err.response) {
          const status = err.response.status;
          const msg = err.response.data?.message || err.response.data?.error_description;
          if (status === 401) {
            throw new Error('PayPal access token was rejected or expired during transaction search.');
          }
          if (status === 403) {
            throw new Error(
              'PayPal account does not have Transaction Search permissions (https://uri.paypal.com/services/reporting/search/read).'
            );
          }
          if (status === 429) {
            throw new Error('PayPal API rate limit reached. Please try again in a few moments.');
          }
          throw new Error(`PayPal Transaction Search failed [${status}]: ${msg || 'Service error'}`);
        }
        throw new Error(`Network error calling PayPal Transaction Search: ${err.message}`);
      }
    } while (currentPage <= totalPages && currentPage <= 10); // Safeguard at 1000 items

    return allRecords;
  }

  /**
   * Normalizes a raw PayPal transaction item to the Transaction schema format.
   */
  static normalizeTransaction(rawItem, userId) {
    const info = rawItem.transaction_info || {};
    const payer = rawItem.payer_info || {};

    const paypalTransactionId = info.transaction_id;
    if (!paypalTransactionId) return null;

    const rawAmount = parseFloat(info.transaction_amount?.value || 0);
    const currency = info.transaction_amount?.currency_code || 'USD';
    const transactionDate = info.transaction_initiation_date
      ? new Date(info.transaction_initiation_date)
      : new Date();

    const merchantName =
      payer.payer_name?.alternate_full_name ||
      info.transaction_subject ||
      info.paypal_account_id ||
      'PayPal Merchant';

    const transactionType = info.transaction_event_code || 'T0000';
    const status = info.transaction_status || 'S';
    const description = info.transaction_note || info.transaction_subject || '';

    return {
      userId,
      paypalTransactionId,
      amount: rawAmount,
      currency,
      transactionDate,
      merchantName,
      transactionType,
      status,
      description,
    };
  }

  /**
   * Calculates the RFC3339 UTC date range.
   * PayPal Transaction Search limits query windows to a maximum of 31 days.
   */
  static calculateDateRange(lastSyncedAt, options = {}) {
    const now = new Date();
    let startDate;
    let endDate = options.endDate ? new Date(options.endDate) : now;

    if (options.startDate) {
      startDate = new Date(options.startDate);
    } else if (lastSyncedAt) {
      // 3-day overlap to capture delayed reports
      startDate = new Date(new Date(lastSyncedAt).getTime() - 3 * 24 * 60 * 60 * 1000);
    } else {
      // Initial sync defaults to 30 days past
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // PayPal API 31-day window limitation enforcement
    const diffMs = endDate.getTime() - startDate.getTime();
    const maxMs = 30.5 * 24 * 60 * 60 * 1000;
    if (diffMs > maxMs) {
      startDate = new Date(endDate.getTime() - maxMs);
    }

    return {
      startIso: startDate.toISOString(),
      endIso: endDate.toISOString(),
    };
  }
}

export default PayPalTransactionService;
