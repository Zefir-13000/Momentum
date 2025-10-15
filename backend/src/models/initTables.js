import { query } from './db.js';

const initTables = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS habits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        color VARCHAR(20),
        icon VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        last_completed_date DATE,
        streak INTEGER DEFAULT 0,
        completed_today BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS habit_logs (
        id SERIAL PRIMARY KEY,
        habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        execution_time TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);
    console.log('Database tables created or already exist');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

export default initTables;