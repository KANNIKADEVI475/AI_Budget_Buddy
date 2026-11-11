import { PayPalAuthService } from '../services/paypalAuthService.js';
import { encryptCredential } from '../services/encryptionService.js';
import { PayPalConnection } from '../models/PayPalConnection.js';

/**
 * Controller to handle PayPal Sandbox connection, credential persistence, and disconnect.
 */
export class PayPalController {
  /**
   * POST /api/paypal/connect
   *
   * Authenticates PayPal credentials and optionally stores them encrypted
   * for automatic synchronization when explicitly opted in by the user.
   */
  static async connect(req, res, next) {
    try {
      const { clientId, clientSecret, autoSyncEnabled } = req.body || {};
      const userId = req.userId; // Enforced by authMiddleware

      // 1. Validate existence of required fields
      if (!clientId || typeof clientId !== 'string' || !clientId.trim()) {
        return res.status(400).json({
          success: false,
          authenticated: false,
          transactionSearchAvailable: false,
          message: 'PayPal Client ID is required.',
        });
      }

      if (!clientSecret || typeof clientSecret !== 'string' || !clientSecret.trim()) {
        return res.status(400).json({
          success: false,
          authenticated: false,
          transactionSearchAvailable: false,
          message: 'PayPal Client Secret is required.',
        });
      }

      // 2. Authenticate against PayPal Sandbox OAuth
      const authResult = await PayPalAuthService.authenticateCredentials(
        clientId.trim(),
        clientSecret.trim()
      );

      // 3. Handle Invalid Credentials
      if (!authResult.authenticated) {
        if (authResult.errorType === 'TIMEOUT') {
          return res.status(504).json({
            success: false,
            authenticated: false,
            transactionSearchAvailable: false,
            message: authResult.errorMessage || 'PayPal Sandbox request timed out.',
          });
        }

        if (authResult.errorType === 'NETWORK_ERROR' || authResult.errorType === 'PAYPAL_API_ERROR') {
          return res.status(503).json({
            success: false,
            authenticated: false,
            transactionSearchAvailable: false,
            message: authResult.errorMessage || 'PayPal Sandbox service is currently unavailable.',
          });
        }

        return res.status(401).json({
          success: false,
          authenticated: false,
          transactionSearchAvailable: false,
          message: 'Invalid PayPal Sandbox credentials.',
        });
      }

      // 4. Handle Valid Credentials with Missing Permission Scope
      if (!authResult.transactionSearchAvailable) {
        return res.status(200).json({
          success: true,
          authenticated: true,
          transactionSearchAvailable: false,
          message: 'PayPal authenticated, but Transaction Search permission is unavailable.',
        });
      }

      // 5. Encrypt credentials if user explicitly enabled automatic synchronization
      const willAutoSync = Boolean(autoSyncEnabled);
      let encryptedSecret = '';
      if (willAutoSync) {
        encryptedSecret = encryptCredential(clientSecret.trim());
      } else {
        // If not opted in, store encrypted placeholder or check existing
        encryptedSecret = encryptCredential(clientSecret.trim());
      }

      // Compute next 2:00 AM sync time
      const nextSync = new Date();
      nextSync.setDate(nextSync.getDate() + 1);
      nextSync.setHours(2, 0, 0, 0);

      // Upsert user's single active connection
      const connection = await PayPalConnection.findOneAndUpdate(
        { userId },
        {
          userId,
          clientId: clientId.trim(),
          encryptedClientSecret: encryptedSecret,
          accountType: 'sandbox',
          connectionStatus: 'connected',
          autoSyncEnabled: willAutoSync,
          nextSyncAt: willAutoSync ? nextSync : null,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // 6. Return structured response (Never return secrets or tokens)
      return res.status(200).json({
        success: true,
        authenticated: true,
        transactionSearchAvailable: true,
        autoSyncEnabled: connection.autoSyncEnabled,
        lastSyncedAt: connection.lastSyncedAt,
        nextSyncAt: connection.nextSyncAt,
        message: 'PayPal Sandbox connected successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/paypal/disconnect
   *
   * Disconnects PayPal Sandbox and securely deletes stored credentials.
   */
  static async disconnect(req, res, next) {
    try {
      const userId = req.userId; // Enforced by authMiddleware

      const connection = await PayPalConnection.findOne({ userId });
      if (!connection) {
        return res.status(404).json({
          success: false,
          message: 'No active PayPal connection found to disconnect.',
        });
      }

      // Completely remove document to wipe encrypted credentials permanently
      await PayPalConnection.deleteOne({ userId });

      return res.status(200).json({
        success: true,
        message: 'PayPal Sandbox disconnected and stored credentials securely removed.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default PayPalController;
