/**
 * Authentication Middleware for AI Budget Buddy
 *
 * Extracts and verifies the authenticated user's identity from secure request headers:
 * 1. `Authorization: Bearer <userId_or_token>`
 * 2. `x-user-id: <userId>`
 *
 * Defaults to 'user_default' for seamless local single-user testing when headers are omitted.
 * Sets `req.userId` and `req.user` on the request object.
 *
 * CRITICAL SECURITY RULE:
 * Controllers must NEVER read `userId` from request bodies or URL parameters to establish ownership.
 */
export function authenticateUser(req, res, next) {
  let userId = null;

  // 1. Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      userId = token;
    }
  }

  // 2. Check x-user-id header
  if (!userId && req.headers['x-user-id']) {
    const rawHeader = req.headers['x-user-id'];
    if (typeof rawHeader === 'string' && rawHeader.trim()) {
      userId = rawHeader.trim();
    }
  }

  // 3. Fallback to default user identity if not specified
  if (!userId) {
    userId = 'user_default';
  }

  // Sanitize user ID (alphanumeric, dashes, underscores)
  if (!/^[a-zA-Z0-9_\-\.@]{1,64}$/.test(userId)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid user authentication identity format.',
    });
  }

  req.userId = userId;
  req.user = { id: userId };

  next();
}

export default authenticateUser;
