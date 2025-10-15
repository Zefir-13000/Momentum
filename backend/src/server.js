import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import initTables from './models/initTables.js';
import authRouter from './routes/auth.js';
import habitsRouter from './routes/habits.js';
import adminRouter from './routes/admin.js';
import statsRouter from './routes/stats.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

// Root
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Routers
app.use('/api/auth', authRouter);
app.use('/api/habits', habitsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/stats', statsRouter);

// Initialize DB tables then start server
initTables()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database tables:', err);
    process.exit(1);
  });