import jwt from 'jsonwebtoken';

/**
 * Requires a valid `token` cookie (main admin session).
 * Attaches the decoded payload to req.user.
 */
export function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired session' });
  }
}

/**
 * Requires a valid `finance` cookie, issued after correct PIN entry.
 * Must run after requireAuth on finance-only routes.
 */
export function requireFinanceAccess(req, res, next) {
  try {
    const token = req.cookies.finance;
    if (!token) return res.status(403).json({ message: 'Finance PIN verification required' });
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ message: 'Finance PIN verification required' });
  }
}
