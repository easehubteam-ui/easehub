import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import path from 'path';
import { env } from './config/env.js';
import { sendResponse } from './utils/apiResponse.js';
import { notFoundMiddleware } from './middleware/notFound.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';

// Import Route Modules
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import serviceRoutes from './routes/service.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import reviewRoutes from './routes/review.routes.js';
import pgRoutes from './routes/pg.routes.js';
import mealRoutes from './routes/meal.routes.js';
import laundryRoutes from './routes/laundry.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app: Application = express();

// 1. Security Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));

// 2. CORS Configuration
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// 4. Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Cookie Parser
app.use(cookieParser());

// Serve Static Uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 6. Health & Root Check API Endpoints
app.get('/', (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'EaseHub Express Backend Server is running.',
    frontendUrl: 'http://localhost:5173',
    healthApi: '/api/health',
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'EaseHub API is running',
    data: {
      environment: env.NODE_ENV,
      databaseStatus: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// 7. Register API Route Groups
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/pg', pgRoutes);
app.use('/api/pgs', pgRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/laundry', laundryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// 8. 404 & Global Error Handler Middlewares
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
