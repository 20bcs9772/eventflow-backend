import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { errorHandler } from './middleware/errorHandler';
import { initializeFirebase } from './config/firebase';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import eventRoutes from './routes/event.routes';
import scheduleRoutes from './routes/schedule.routes';
import announcementRoutes from './routes/announcement.routes';
import guestEventRoutes from './routes/guestEvent.routes';
import deviceRoutes from './routes/device.routes';

// Socket handlers
import { setupSocketHandlers } from './socket/socketHandlers';

// Load environment variables
dotenv.config();

const app: Express = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize Firebase Admin SDK
try {
  initializeFirebase();
} catch (error) {
  console.warn('Firebase initialization failed. Push notifications will not work:', error);
}

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/guests', guestEventRoutes);
app.use('/api/devices', deviceRoutes);

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Error handling middleware (must be last)
app.use(errorHandler);

// Make io available to routes via app.locals
app.locals.io = io;

export { app, httpServer, io };

