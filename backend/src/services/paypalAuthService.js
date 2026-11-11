import axios from 'axios';
import { PAYPAL_CONFIG } from '../config/paypal.js';

/**
 * Service to handle PayPal Sandbox OAuth 2.0 authentication
 * using the Client Credentials Grant.
 */
export class PayPalAuthService {
  /**
   * Authenticates client credentials and optionally returns an in-memory access token.
   *
   * @param {string} clientId - PayPal Sandbox Application Client ID
   * @param {string} clientSecret - PayPal Sandbox Application Client Secret
   * @param {boolean} returnToken - Whether to return the ephemeral access token in-memory
   * @returns {Promise<{
   *   authenticated: boolean,
   *   transactionSearchAvailable: boolean,
   *   accessToken?: string,
   *   errorType?: string,
   *   errorMessage?: string
   * }>}
   */
  static async authenticateCredentials(clientId, clientSecret, returnToken = false) {
    if (!clientId || typeof clientId !== 'string' || !clientId.trim()) {
      return {
        authenticated: false,
        transactionSearchAvailable: false,
        errorType: 'MISSING_CLIENT_ID',
        errorMessage: 'PayPal Client ID is required.',
      };
    }

    if (!clientSecret || typeof clientSecret !== 'string' || !clientSecret.trim()) {
      return {
        authenticated: false,
        transactionSearchAvailable: false,
        errorType: 'MISSING_CLIENT_SECRET',
        errorMessage: 'PayPal Client Secret is required.',
      };
    }

    // 1. Prepare Basic Auth header using Base64 encoding
    const credentials = `${clientId.trim()}:${clientSecret.trim()}`;
    const basicAuth = Buffer.from(credentials).toString('base64');

    // 2. Body parameters for Client Credentials Grant
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    try {
      // 3. Make POST request to PayPal Sandbox OAuth endpoint
      // Note: Never log `basicAuth`, `clientId`, or `clientSecret`
      const response = await axios.post(PAYPAL_CONFIG.OAUTH_TOKEN_URL, params.toString(), {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
        },
        timeout: PAYPAL_CONFIG.REQUEST_TIMEOUT_MS,
      });

      // 4. Verify token response
      if (response.status === 200 && response.data?.access_token) {
        const rawScope = response.data.scope || '';
        const grantedScopes = rawScope.split(/\s+/).filter(Boolean);

        // Check if the mandatory Transaction Search scope is present
        const hasReportingScope = grantedScopes.includes(
          PAYPAL_CONFIG.REQUIRED_REPORTING_SCOPE
        );

        return {
          authenticated: true,
          transactionSearchAvailable: hasReportingScope,
          accessToken: returnToken ? response.data.access_token : undefined,
        };
      }

      return {
        authenticated: false,
        transactionSearchAvailable: false,
        errorType: 'INVALID_CREDENTIALS',
        errorMessage: 'Invalid PayPal Sandbox credentials.',
      };
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data || {};

        if (status === 401 || errorData.error === 'invalid_client') {
          return {
            authenticated: false,
            transactionSearchAvailable: false,
            errorType: 'INVALID_CREDENTIALS',
            errorMessage: 'Invalid PayPal Sandbox credentials.',
          };
        }

        return {
          authenticated: false,
          transactionSearchAvailable: false,
          errorType: 'PAYPAL_API_ERROR',
          errorMessage: 'PayPal Sandbox service error occurred during authentication.',
        };
      }

      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return {
          authenticated: false,
          transactionSearchAvailable: false,
          errorType: 'TIMEOUT',
          errorMessage: 'Connection to PayPal Sandbox timed out. Please try again.',
        };
      }

      return {
        authenticated: false,
        transactionSearchAvailable: false,
        errorType: 'NETWORK_ERROR',
        errorMessage: 'Unable to reach PayPal Sandbox service. Check your internet connection.',
      };
    }
  }

  /**
   * Internal helper to obtain an ephemeral access token for transaction synchronization.
   * Checks reporting permission before returning.
   */
  static async getAccessToken(clientId, clientSecret) {
    const result = await this.authenticateCredentials(clientId, clientSecret, true);
    if (!result.authenticated || !result.accessToken) {
      throw new Error(result.errorMessage || 'Failed to authenticate with PayPal Sandbox');
    }
    if (!result.transactionSearchAvailable) {
      throw new Error(
        'PayPal Sandbox account lacks required Transaction Search scope (https://uri.paypal.com/services/reporting/search/read).'
      );
    }
    return result.accessToken;
  }
}

export default PayPalAuthService;
