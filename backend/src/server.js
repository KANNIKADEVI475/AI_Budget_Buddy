import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import { initDailySyncJob } from './jobs/dailySyncJob.js';
import paypalRoutes from './routes/paypalRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const IS_PROD = process.env.NODE_ENV === 'production';

// 1. Enforce HTTPS in production environments
if (IS_PROD) {
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    if (!isHttps) {
      return res.status(403).json({
        success: false,
        message: 'HTTPS is required in production for secure credential transmission.',
      });
    }
    next();
  });
}

// 2. Helmet HTTP Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", FRONTEND_URL, 'https://api-m.sandbox.paypal.com'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// 3. CORS Configuration: restrict to authorized frontend origin only
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === FRONTEND_URL ||
        origin === 'http://localhost:5173' ||
        origin === 'http://127.0.0.1:5173'
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not permitted by CORS policy.`));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
    credentials: true,
    maxAge: 86400,
  })
);

// 4. Request Body Size Limiting
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'ai-budget-buddy-backend',
    paypalEnv: 'sandbox',
    cronActive: true,
    timestamp: new Date().toISOString(),
  });
});

// 6. Application Routes
app.use('/api/paypal', paypalRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/ai', aiRoutes);

// 7. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found.',
  });
});

// 8. Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err.name || 'InternalError', err.message || '');

  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Cross-Origin Request Blocked by security policy.',
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request body.',
    });
  }

  res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred. Please try again later.',
  });
});

// Start Database & Server
async function startServer() {
  try {
    await connectDatabase();

    // Start Daily Cron Job (2:00 AM Asia/Kolkata)
    initDailySyncJob();

    app.listen(PORT, () => {
      console.log(`[AI Budget Buddy Backend] Server running on port ${PORT}`);
      console.log(`[AI Budget Buddy Backend] Target PayPal: SANDBOX (https://api-m.sandbox.paypal.com)`);
      console.log(`[AI Budget Buddy Backend] Allowed Frontend: ${FRONTEND_URL}`);
    });
  } catch (err) {
    console.error('[AI Budget Buddy Backend] Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();

export default app;
