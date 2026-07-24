import jwt from 'jsonwebtoken';

const isProd = () => process.env.NODE_ENV === 'production';

export function signSession(user) {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function signFinanceToken(user) {
  return jwt.sign({ id: user._id, finance: true }, process.env.JWT_SECRET, {
    expiresIn: '30m',
  });
}

export function setSessionCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd(),
    sameSite: isProd() ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function setFinanceCookie(res, token) {
  res.cookie('finance', token, {
    httpOnly: true,
    secure: isProd(),
    sameSite: isProd() ? 'none' : 'lax',
    maxAge: 30 * 60 * 1000,
  });
}

export function clearAuthCookies(res) {
  res.clearCookie('token');
  res.clearCookie('finance');
}
