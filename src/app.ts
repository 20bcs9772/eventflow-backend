import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { createServer } from "http";
import { errorHandler } from "./middleware/errorHandler";
import { initializeFirebase } from "./config/firebase";
import swaggerUi from "swagger-ui-express";
import { swaggerSpecs } from "./docs/swagger";

// Routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import eventRoutes from "./routes/event.routes";
import scheduleRoutes from "./routes/schedule.routes";
import announcementRoutes from "./routes/announcement.routes";
import guestEventRoutes from "./routes/guestEvent.routes";
import deviceRoutes from "./routes/device.routes";

// Load environment variables
dotenv.config();

const app: Express = express();
const httpServer = createServer(app);

// Initialize Firebase Admin SDK
try {
  initializeFirebase();
} catch (error) {
  console.warn(
    "Firebase initialization failed. Push notifications will not work:",
    error
  );
}

// Middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Health check under /api for Swagger basePath
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/guests", guestEventRoutes);
app.use("/api/devices", deviceRoutes);

// Swagger docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.get("/api/docs.json", (_req, res) => {
  res.json(swaggerSpecs);
});

// Error handling middleware (must be last)
app.use(errorHandler);

export { app, httpServer };
