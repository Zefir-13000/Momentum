import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'postgres',
  password: process.env.PG_PASSWORD || '125436',
  port: Number(process.env.PG_PORT) || 5432,
});

pool.on('error', (err) => {
  console.error('Unexpected PG error', err);
  process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);
export default pool;