import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_TOKEN;

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).send('No token provided');

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Expect payload to include { id, email, role }
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch (err) {
    console.error('Token verification error', err);
    return res.status(401).send('Invalid token');
  }
};

export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).send('No role found on token');
    if (role !== requiredRole) return res.status(403).send('Forbidden');
    next();
  };
};