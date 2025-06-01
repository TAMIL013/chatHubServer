import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { authMiddleware } from './middlewares/authMiddleware.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/chat', authMiddleware, chatRoutes);
app.use(errorHandler);

export default app;
