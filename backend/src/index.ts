import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import productRoutes from './routes/product.routes.js';
import scrapeRoutes from './routes/scrape.routes.js';
import aiRoutes from './routes/ai.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { initScheduler } from './services/scheduler.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL && process.env.FRONTEND_URL.trim() !== ''
        ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
        : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/scrape', scrapeRoutes);
app.use('/api', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root welcome endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'ScrapeHub Backend API',
    version: '1.0.0',
    endpoints: [
      'GET    /api/products?platform=TOKOPEDIA&minPrice=0&maxPrice=10000000&minRating=0&limit=50',
      'GET    /api/products/:id',
      'POST   /api/products',
      'PUT    /api/products/:id',
      'POST   /api/scrape',
      'GET    /api/trends/latest',
      'POST   /api/ai/analyze',
      'POST   /api/auth/login',
      'POST   /api/auth/logout',
      'GET    /api/auth/me',
      'GET    /api/admin/products?platform=&limit=',
      'DELETE /api/admin/products/:id',
      'GET    /api/admin/logs',
      'GET    /api/admin/config-status',
      'GET    /api/health',
    ],
  });
});

// Initialize background scheduler (cron job every 6 hours)
initScheduler();

// Start HTTP server
app.listen(PORT, () => {
  console.log(`[ScrapeHub Backend] Server running on http://localhost:${PORT}`);
  console.log(`[ScrapeHub Backend] Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
