import express from 'express';
import { client, connectToMongoDB } from './db.js';
import cors from 'cors';
import apiRouter from './routes/api.js';
import authRouter from './routes/auth.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://blue-protocol-db-test.netlify.app',
    ],
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // body를 파싱해주기 위해 필요한 미들웨어

async function startServer() {
  try {
    await connectToMongoDB();
    app.listen(process.env.PORT, () => {
      console.log('server is running on port: ' + process.env.PORT);
    });
  } catch (err) {
    console.error(err);
  }
}

startServer();

app.get('/', async (req, res) => {});

app.use('/api', apiRouter);
app.use('/auth', authRouter);
