import express from 'express';
import { query } from '../models/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Helpers
 */
const toDateOnly = (dt) => {
  const d = new Date(dt);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

const computeStreakFromDateStrings = (dateStrings) => {
  // dateStrings: array of YYYY-MM-DD, assumed unique and not necessarily sorted
  const set = new Set(dateStrings);
  let streak = 0;
  const today = new Date();
  today.setHours(0,0,0,0);

  while (true) {
    const curStr = today.toISOString().slice(0,10);
    if (set.has(curStr)) {
      streak++;
      today.setDate(today.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

/**
 * Create habit
 */
router.post('/', verifyToken, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).send('Unauthorized');

  const { title, description, color, icon } = req.body;
  if (!title) return res.status(400).send('Title is required');

  try {
    const sql = `
      INSERT INTO habits (user_id, title, description, color, icon)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [userId, title, description || null, color || null, icon || null];
    const result = await query(sql, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating habit:', err);
    res.status(500).send('Server error');
  }
});

/**
 * List user's habits
 * This endpoint computes up-to-date streak and completed_today from habit_logs
 * so UI always sees accurate streak even if nightly reset hasn't run.
 */
router.get('/', verifyToken, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).send('Unauthorized');

  try {
    const habRes = await query(
      'SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    const habits = habRes.rows;
    if (habits.length === 0) return res.json([]);

    const results = [];

    for (const h of habits) {
      // Fetch log dates as "YYYY-MM-DD" strings (Postgres formats consistently)
      const logsRes = await query(
        `SELECT to_char(execution_time::date, 'YYYY-MM-DD') AS d
         FROM habit_logs
         WHERE habit_id = $1
         GROUP BY execution_time::date
         ORDER BY execution_time::date DESC`,
        [h.id]
      );

      const dateStrings = logsRes.rows.map(r => r.d);
      const streak = computeStreakFromDateStrings(dateStrings);

      // Reliable check for "completed_today"
      const completedTodayRes = await query(
        `SELECT 1 FROM habit_logs WHERE habit_id = $1 AND execution_time::date = CURRENT_DATE LIMIT 1`,
        [h.id]
      );
      const completed_today = completedTodayRes.rowCount > 0;

      // Most recent completion date
      const last_completed_date = dateStrings.length > 0 ? dateStrings[0] : null;

      // Persist derived fields if necessary
      try {
        await query(
          `UPDATE habits
           SET streak = $1, completed_today = $2, last_completed_date = $3
           WHERE id = $4`,
          [streak, completed_today, last_completed_date, h.id]
        );
      } catch (updErr) {
        console.warn('Failed to persist habit derived values', updErr);
      }

      results.push({
        ...h,
        streak,
        completed_today,
        last_completed_date,
      });
    }

    res.json(results);
  } catch (err) {
    console.error('Error listing habits:', err);
    res.status(500).send('Server error');
  }
});


/**
 * Get single habit (must belong to user)
 */
router.get('/:id', verifyToken, async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user?.id;

  try {
    const result = await query('SELECT * FROM habits WHERE id = $1', [id]);
    const habit = result.rows[0];
    if (!habit) return res.status(404).send('Habit not found');
    if (habit.user_id !== userId) return res.status(403).send('Forbidden');

    // get distinct log dates as ISO yyyy-mm-dd strings (handled on DB side)
    const logsRes = await query(
      `SELECT to_char(execution_time::date, 'YYYY-MM-DD') AS d
       FROM habit_logs
       WHERE habit_id = $1
       GROUP BY execution_time::date
       ORDER BY execution_time::date DESC`,
      [id]
    );

    const dateStrings = logsRes.rows.map(r => r.d); // already "YYYY-MM-DD" strings

    // compute streak/completed_today based on dateStrings
    const streak = computeStreakFromDateStrings(dateStrings);

    // robust check for "completed_today": ask DB if there's any row with date = CURRENT_DATE
    const completedTodayRes = await query(
      `SELECT 1 FROM habit_logs WHERE habit_id = $1 AND execution_time::date = CURRENT_DATE LIMIT 1`,
      [id]
    );
    const completed_today = completedTodayRes.rowCount > 0;

    // last_completed_date (most recent date string) or null
    const last_completed_date = dateStrings.length > 0 ? dateStrings[0] : null;

    // update habit record with derived values (best-effort)
    try {
      await query(
        'UPDATE habits SET streak = $1, completed_today = $2, last_completed_date = $3 WHERE id = $4',
        [streak, completed_today, last_completed_date, id]
      );
    } catch (updErr) {
      console.warn('Failed to persist habit derived values', updErr);
    }

    res.json({
      ...habit,
      streak,
      completed_today,
      last_completed_date,
    });
  } catch (err) {
    console.error('Error getting habit:', err);
    res.status(500).send('Server error');
  }
});

/**
 * Update habit (user-scoped)
 */
router.put('/:id', verifyToken, async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user?.id;
  const { title, description, color, icon } = req.body;

  try {
    const check = await query('SELECT user_id FROM habits WHERE id = $1', [id]);
    if (!check.rows[0]) return res.status(404).send('Habit not found');
    if (check.rows[0].user_id !== userId) return res.status(403).send('Forbidden');

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
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating habit:', err);
    res.status(500).send('Server error');
  }
});

/**
 * Delete habit
 */
router.delete('/:id', verifyToken, async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user?.id;

  try {
    const result = await query('DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
    if (!result.rows[0]) return res.status(404).send('Habit not found or not owned by user');
    res.json({ deleted: true });
  } catch (err) {
    console.error('Error deleting habit:', err);
    res.status(500).send('Server error');
  }
});

/**
 * Complete habit for today
 * - Creates a habit_log for now
 * - Updates habit's last_completed_date, streak, completed_today
 * Rules:
 *  - If already completed today -> 200 no-op
 *  - If last completion was yesterday -> streak +1
 *  - If last completion was earlier than yesterday -> streak = 1
 */
router.post('/:id/complete', verifyToken, async (req, res) => {
  const habitId = Number(req.params.id);
  const userId = req.user?.id;

  try {
    const h = await query('SELECT user_id, last_completed_date, streak FROM habits WHERE id = $1', [habitId]);
    if (!h.rows[0]) return res.status(404).send('Habit not found');
    if (h.rows[0].user_id !== userId) return res.status(403).send('Forbidden');

    const now = new Date();
    const today = toDateOnly(now);

    // check if already completed today by querying logs (safer than trusting DB flag)
    const alreadyRes = await query(
      `SELECT 1 FROM habit_logs WHERE habit_id = $1 AND CAST(execution_time AS date) = $2 LIMIT 1`,
      [habitId, today]
    );
    if (alreadyRes.rows.length > 0) {
      // return updated habit
      const habitRes = await query('SELECT * FROM habits WHERE id = $1', [habitId]);
      return res.status(200).json(habitRes.rows[0]);
    }

    // insert log for now
    const time = now.toISOString();
    await query('INSERT INTO habit_logs (habit_id, execution_time) VALUES ($1, $2)', [habitId, time]);

    // recompute streak based on distinct log dates
    const datesRes = await query(
      `SELECT CAST(execution_time AS date) as d
       FROM habit_logs
       WHERE habit_id = $1
       GROUP BY CAST(execution_time AS date)
       ORDER BY d DESC`,
      [habitId]
    );
    const dateStrings = datesRes.rows.map(r => r.d.toISOString().slice(0,10));
    const streak = computeStreakFromDateStrings(dateStrings);

    const last_completed_date = dateStrings.length > 0 ? dateStrings[0] : null;

    const upd = await query(
      'UPDATE habits SET last_completed_date = $1, streak = $2, completed_today = TRUE WHERE id = $3 RETURNING *',
      [last_completed_date, streak, habitId]
    );

    res.status(201).json(upd.rows[0]);
  } catch (err) {
    console.error('Error completing habit:', err);
    res.status(500).send('Server error');
  }
});

/**
 * Un-complete habit for today (remove today's logs and recompute streak)
 */
router.post('/:id/uncomplete', verifyToken, async (req, res) => {
  const habitId = Number(req.params.id);
  const userId = req.user?.id;

  try {
    const h = await query('SELECT user_id FROM habits WHERE id = $1', [habitId]);
    if (!h.rows[0]) return res.status(404).send('Habit not found');
    if (h.rows[0].user_id !== userId) return res.status(403).send('Forbidden');

    const today = toDateOnly(new Date());

    // delete today's logs
    await query(
      `DELETE FROM habit_logs WHERE habit_id = $1 AND CAST(execution_time AS date) = $2`,
      [habitId, today]
    );

    // recompute distinct log dates for habit
    const logs = await query(
      `SELECT CAST(execution_time AS date) as d
       FROM habit_logs
       WHERE habit_id = $1
       GROUP BY CAST(execution_time AS date)
       ORDER BY d DESC`,
      [habitId]
    );

    const dateStrings = logs.rows.map(r => r.d.toISOString().slice(0,10));
    const streak = computeStreakFromDateStrings(dateStrings);
    const last_completed_date = dateStrings.length > 0 ? dateStrings[0] : null;
    const completed_today = dateStrings.includes(new Date().toISOString().slice(0,10));

    await query('UPDATE habits SET last_completed_date = $1, streak = $2, completed_today = $3 WHERE id = $4',
      [last_completed_date, streak, completed_today, habitId]);

    const updated = await query('SELECT * FROM habits WHERE id = $1', [habitId]);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Error uncompleting habit:', err);
    res.status(500).send('Server error');
  }
});

/**
 * List logs for habit
 */
router.get('/:id/logs', verifyToken, async (req, res) => {
  const habitId = Number(req.params.id);
  const userId = req.user?.id;

  try {
    const h = await query('SELECT user_id FROM habits WHERE id = $1', [habitId]);
    if (!h.rows[0]) return res.status(404).send('Habit not found');
    if (h.rows[0].user_id !== userId) return res.status(403).send('Forbidden');

    const result = await query('SELECT * FROM habit_logs WHERE habit_id = $1 ORDER BY execution_time DESC', [habitId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error listing habit logs:', err);
    res.status(500).send('Server error');
  }
});

export default router;