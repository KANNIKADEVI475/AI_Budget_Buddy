import cron from 'node-cron';
import { TransactionSyncService } from '../services/transactionSyncService.js';

/**
 * Daily Automatic Transaction Synchronization Job
 *
 * Runs every day at 2:00 AM in the 'Asia/Kolkata' timezone.
 *
 * ARCHITECTURAL NOTE:
 * node-cron requires a continuously running backend (e.g. Node process on VPS, Render, ECS, Docker).
 * For serverless platforms (e.g. AWS Lambda, Vercel), replace or augment this cron job with a
 * managed scheduler such as AWS EventBridge, Google Cloud Scheduler, or GitHub Actions
 * invoking a secured `/api/jobs/sync` webhook with an HMAC or API secret key.
 */
export function initDailySyncJob() {
  const cronExpression = '0 2 * * *'; // 02:00 AM every day
  const timezone = 'Asia/Kolkata';

  console.log(`[DailySyncJob] Initializing daily cron job: "${cronExpression}" (${timezone})`);

  const job = cron.schedule(
    cronExpression,
    async () => {
      console.log(`[DailySyncJob] Executing scheduled daily transaction sync at 2:00 AM (${timezone})...`);
      try {
        await TransactionSyncService.syncAllActiveUsers();
      } catch (err) {
        console.error('[DailySyncJob] Error in daily sync execution:', err.message);
      }
    },
    {
      scheduled: true,
      timezone,
    }
  );

  return job;
}

export default initDailySyncJob;
