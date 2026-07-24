import bcrypt from 'bcrypt';
import { User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signSession, setSessionCookie, clearAuthCookies } from '../utils/tokens.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  setSessionCookie(res, signSession(user));
  res.json({ user: { email: user.email } });
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookies(res);
  res.status(204).end();
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: { email: req.user.email } });
});
