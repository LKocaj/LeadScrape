import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'express-async-errors';
import { leadsRouter } from './routes/leads.routes.js';
import { statsRouter } from './routes/stats.routes.js';
import { scrapeRouter } from './routes/scrape.routes.js';
import { exportRouter } from './routes/export.routes.js';
import { importRouter } from './routes/import.routes.js';
import { analyticsRouter } from './routes/analytics.routes.js';
import { enumsRouter } from './routes/enums.routes.js';
import { oncallRouter } from './routes/oncall.routes.js';
import { enrichmentRouter } from './routes/enrichment.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api/leads', leadsRouter);
  app.use('/api/stats', statsRouter);
  app.use('/api/scrape', scrapeRouter);
  app.use('/api/export', exportRouter);
  app.use('/api/import', importRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/enums', enumsRouter);
  app.use('/api/enrichment', enrichmentRouter);
  app.use('/api', oncallRouter);

  // Serve React build in production
  if (process.env.NODE_ENV === 'production') {
    const webBuildPath = path.join(__dirname, '../../web/dist');
    app.use(express.static(webBuildPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(webBuildPath, 'index.html'));
    });
  }

  app.use(errorMiddleware);

  return app;
}
