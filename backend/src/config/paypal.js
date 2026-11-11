/**
 * PayPal Sandbox Configuration
 *
 * Strict Sandbox mode configuration for AI Budget Buddy OAuth authentication
 * and Transaction Search API v1.
 * Live PayPal endpoints are strictly prohibited.
 */

export const PAYPAL_CONFIG = {
  // Always enforce the official PayPal Sandbox API Base URL
  BASE_URL: 'https://api-m.sandbox.paypal.com',

  // OAuth 2.0 token issuance endpoint
  OAUTH_TOKEN_PATH: '/v1/oauth2/token',
  get OAUTH_TOKEN_URL() {
    return `${this.BASE_URL}${this.OAUTH_TOKEN_PATH}`;
  },

  // Transaction Search API v1 endpoint
  TRANSACTIONS_PATH: '/v1/reporting/transactions',
  get TRANSACTIONS_URL() {
    return `${this.BASE_URL}${this.TRANSACTIONS_PATH}`;
  },

  // The critical reporting scope required for Transaction Search & spend analysis
  REQUIRED_REPORTING_SCOPE: 'https://uri.paypal.com/services/reporting/search/read',

  // Network request timeout in milliseconds
  REQUEST_TIMEOUT_MS: 15000,
};

export default PAYPAL_CONFIG;
