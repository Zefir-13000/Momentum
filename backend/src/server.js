import express, { json } from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(json());

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});