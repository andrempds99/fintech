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

// Security middleware with enhanced configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding if needed
  })
);

// CORS configuration - supports CloudFront and multiple origins
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN || '';
const corsOrigin = process.env.CORS_ORIGIN || '';
const additionalOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

// Build allowed origins list
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  frontendUrl,
  cloudfrontDomain,
  corsOrigin,
  ...additionalOrigins,
]
  .filter(url => url && url !== '') // Remove empty strings
  .filter((url, index, self) => self.indexOf(url) === index); // Remove duplicates

// Log allowed origins in development
if (process.env.NODE_ENV !== 'production') {
  logger.info('CORS Allowed Origins:', { origins: allowedOrigins });
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      
      // Check if origin matches allowed list (exact match or starts with)
      const isAllowed = allowedOrigins.some(allowed => {
        // Exact match
        if (origin === allowed) return true;
        // Match if origin starts with allowed (for CloudFront subdomains)
        if (allowed && origin.startsWith(allowed)) return true;
        return false;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        // In development, log rejected origins for debugging
        if (process.env.NODE_ENV !== 'production') {
          logger.warn('CORS blocked origin:', { origin, allowedOrigins });
        }
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
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

