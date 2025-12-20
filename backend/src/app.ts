import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import logger from './utils/logger';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import accountRoutes from './routes/accounts';
import transactionRoutes from './routes/transactions';
import transferRoutes from './routes/transfers';
import analyticsRoutes from './routes/analytics';
import adminRoutes from './routes/admin';
import goalsRoutes from './routes/goals';
import exportRoutes from './routes/export';
import alertsRoutes from './routes/alerts';
import scheduledTransfersRoutes from './routes/scheduled-transfers';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app: Express = express();

// Security middleware
app.use(helmet());

// CORS configuration
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  frontendUrl,
].filter((url, index, self) => self.indexOf(url) === index); // Remove duplicates

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/scheduled-transfers', scheduledTransfersRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;

