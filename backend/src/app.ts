import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { mediaRouter } from './modules/media/index.js';
import { errorHandler, notFoundHandler, apiLimiter } from './middleware/index.js';

const app = express();

// Behind a host's load balancer, req.ip is the proxy's IP unless we trust
// X-Forwarded-For. Without this, every client shares one rate-limit bucket.
const trustProxy = env.TRUST_PROXY ?? (env.NODE_ENV === 'production' ? 1 : 0);
if (trustProxy > 0) {
  app.set('trust proxy', trustProxy);
}

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: env.NODE_ENV === 'development' 
    ? true  // Allow all origins in development
    : [env.APP_URL, env.ADMIN_URL],
  credentials: true,
};
app.use(cors(corsOptions));

// Public image bytes, mounted ahead of apiLimiter (it has its own, looser limit)
app.use('/api/media', mediaRouter);

// Rate limiting
app.use('/api', apiLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
