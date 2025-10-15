import express from 'express';
import { query } from '../models/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/stats
 * Returns:
 *  - user_streak: number (consecutive days with at least one completion, includes today if completed)
 *  - per_habit: [{ id, title, streak, completion_rate }]
 */
router.get('/', verifyToken, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).send('Unauthorized');

  try {
    // 1) load user's habits
    const habRes = await query('SELECT id, title, created_at FROM habits WHERE user_id = $1', [userId]);
    const habits = habRes.rows;

    const habitIds = habits.map((h) => h.id);
    if (habitIds.length === 0) {
      return res.json({ user_streak: 0, per_habit: [] });
    }

    // 2) load distinct log dates per habit and overall distinct dates
    const logsRes = await query(
      `SELECT habit_id, CAST(execution_time AS date) as d
       FROM habit_logs
       WHERE habit_id = ANY($1)
       GROUP BY habit_id, CAST(execution_time AS date)
       ORDER BY habit_id, CAST(execution_time AS date) DESC`,
      [habitIds]
    );

    // Build map habitId -> array of date strings (YYYY-MM-DD) sorted desc
    const perHabitDates = {};
    for (const row of logsRes.rows) {
      const hid = row.habit_id;
      const d = row.d.toISOString().slice(0, 10);
      if (!perHabitDates[hid]) perHabitDates[hid] = [];
      perHabitDates[hid].push(d);
    }

    // 3) compute per-habit stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const resultsPerHabit = habits.map((h) => {
      const dates = perHabitDates[h.id] || [];
      // unique ordered descending
      const uniqueDates = Array.from(new Set(dates));

      // compute streak for this habit (consecutive days ending today)
      let streak = 0;
      let cursor = new Date();
      cursor.setHours(0, 0, 0, 0);

      const dateSet = new Set(uniqueDates); // strings YYYY-MM-DD

      while (true) {
        const cursorStr = cursor.toISOString().slice(0, 10);
        if (dateSet.has(cursorStr)) {
          streak++;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      }

      // compute completion rate: unique days with logs / days since created (inclusive)
      const created = new Date(h.created_at);
      created.setHours(0, 0, 0, 0);
      const daysSince = Math.max(1, Math.floor((today - created) / (1000 * 60 * 60 * 24)) + 1);
      const uniqueCount = uniqueDates.length;
      const completion_rate = Math.round((uniqueCount / daysSince) * 100);

      return {
        id: h.id,
        title: h.title,
        streak,
        completion_rate,
      };
    });

    // 4) compute user-level streak: days with at least one completion across any habit
    const overallDatesRes = await query(
      `SELECT CAST(execution_time AS date) as d
       FROM habit_logs hl
       JOIN habits h ON hl.habit_id = h.id
       WHERE h.user_id = $1
       GROUP BY CAST(execution_time AS date)
       ORDER BY CAST(execution_time AS date) DESC`,
      [userId]
    );

    const overallDates = overallDatesRes.rows.map((r) => r.d.toISOString().slice(0, 10));
    const overallSet = new Set(overallDates);

    let userStreak = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    while (true) {
      const cursorStr = cursor.toISOString().slice(0, 10);
      if (overallSet.has(cursorStr)) {
        userStreak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    res.json({
      user_streak: userStreak,
      per_habit: resultsPerHabit,
    });
  } catch (err) {
    console.error('Error computing stats:', err);
    res.status(500).send('Server error');
  }
});

export default router;