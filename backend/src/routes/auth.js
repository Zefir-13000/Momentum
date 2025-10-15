import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail, getUserById } from '../models/user.js';
import { verifyToken } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_TOKEN;

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).send('Email and password required');

    const existing = await getUserByEmail(email);
    if (existing) return res.status(409).send('User already exists');

    const password_hash = await bcrypt.hash(password, 10);

    const user = await createUser(email, password_hash, role || 'user');

    res.status(201).json({ id: user.id, email: user.email, role: user.role, created_at: user.created_at });
  } catch (err) {
    console.error('Error in /register', err);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send('Email and password required');

    const user = await getUserByEmail(email);
    if (!user) return res.status(401).send('Invalid credentials');

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).send('Invalid credentials');

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error('Error in /login', err);
    res.status(500).send('Server error');
  }
});

// Me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const id = req.user?.id;
    if (!id) return res.status(401).send('Invalid token payload');

    const user = await getUserById(id);
    if (!user) return res.status(404).send('User not found');

    res.json({ id: user.id, email: user.email, role: user.role, created_at: user.created_at });
  } catch (err) {
    console.error('Error in /me', err);
    res.status(500).send('Server error');
  }
});

export default router;