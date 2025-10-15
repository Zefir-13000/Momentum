import express from 'express';
import { query } from '../models/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin role
router.use(verifyToken, requireRole('admin'));

// List all users
router.get('/users', async (req, res) => {
  try {
    const result = await query('SELECT id, email, role, created_at FROM users ORDER BY created_at DESC', []);
    res.json(result.rows);
  } catch (err) {
    console.error('Error listing users:', err);
    res.status(500).send('Server error');
  }
});

// List all habits (admin)
router.get('/habits', async (req, res) => {
  try {
    const result = await query(`
      SELECT h.*, u.email as owner_email
      FROM habits h
      JOIN users u ON u.id = h.user_id
      ORDER BY h.created_at DESC
    `, []);
    res.json(result.rows);
  } catch (err) {
    console.error('Error listing habits (admin):', err);
    res.status(500).send('Server error');
  }
});

// Create habit for any user (admin)
router.post('/habits', async (req, res) => {
  const { user_id, title, description, color, icon } = req.body;
  if (!user_id || !title) return res.status(400).send('user_id and title are required');

  try {
    const sql = `
      INSERT INTO habits (user_id, title, description, color, icon)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [user_id, title, description || null, color || null, icon || null];
    const result = await query(sql, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating habit (admin):', err);
    res.status(500).send('Server error');
  }
});

// Update any habit (admin)
router.put('/habits/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { title, description, color, icon } = req.body;

  try {
    const sql = `
      UPDATE habits
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        color = COALESCE($3, color),
        icon = COALESCE($4, icon)
      WHERE id = $5
      RETURNING *
    `;
    const values = [title, description, color, icon, id];
    const result = await query(sql, values);
    if (!result.rows[0]) return res.status(404).send('Habit not found');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating habit (admin):', err);
    res.status(500).send('Server error');
  }
});

// Delete any habit (admin)
router.delete('/habits/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await query('DELETE FROM habits WHERE id = $1 RETURNING *', [id]);
    if (!result.rows[0]) return res.status(404).send('Habit not found');
    res.json({ deleted: true });
  } catch (err) {
    console.error('Error deleting habit (admin):', err);
    res.status(500).send('Server error');
  }
});

export default router;