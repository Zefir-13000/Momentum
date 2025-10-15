import { query } from './db.js';

/**
 * User model functions (new schema)
 * users:
 *  - id (pk)
 *  - email
 *  - password_hash
 *  - role
 *  - created_at
 */

export const createUser = async (email, password_hash, role = 'user') => {
  const sql = `
    INSERT INTO users (email, password_hash, role)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [email, password_hash, role];

  try {
    const result = await query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  const sql = 'SELECT * FROM users WHERE email = $1';
  try {
    const result = await query(sql, [email]);
    return result.rows[0];
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
};

export const getUserById = async (id) => {
  const sql = 'SELECT * FROM users WHERE id = $1';
  try {
    const result = await query(sql, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error getting user by id:', error);
    throw error;
  }
};