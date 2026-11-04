import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initProductionData } from './seed/seedData.js';
import { initDeadlineScheduler } from './services/deadlineReminderService.js';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// Security & Parsing Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: '*', // Allow development frontend
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads folder
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(uploadDir));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'ScholarSphere - GNDEC Scholarship Portal',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', routes);

// Central Error Handler
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    
    // Initialize essential production system data (departments, admin, officer, PMS scheme)
    await initProductionData();

    // Start automated scholarship deadline reminders scheduler (Asia/Kolkata timezone)
    initDeadlineScheduler();

    app.listen(PORT, () => {
      console.log(`🚀 ScholarSphere Backend API running on port ${PORT}`);
      console.log(`📊 Health Endpoint: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
