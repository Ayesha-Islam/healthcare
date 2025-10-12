import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './server/infrastructure/config/logger';
import { container } from './server/infrastructure/container';

// Middleware
import { errorHandler } from './server/presentation/middleware/error-handler';
import { requestLogger } from './server/presentation/middleware/request-logger';
import { rateLimiter } from './server/presentation/middleware/rate-limiter';

// Routes
import routes from './server/presentation/routes';

const app: Express = express();
const PORT = process.env.API_PORT || 3001;

// Trust proxy - important for rate limiting and getting real IPs
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for API
    crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Raw body for Twilio webhook verification
app.use('/api/twilio', express.raw({ type: 'application/x-www-form-urlencoded' }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter);

// Health check endpoint (before rate limiting)
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
    });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        path: req.path,
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
const shutdown = async () => {
    logger.info('Shutting down gracefully...');

    try {
        await container.cleanup();
        logger.info('Container cleaned up');
        process.exit(0);
    } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
const server = app.listen(PORT, () => {
    logger.info(`🚀 Express API server running on port ${PORT}`);
    logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    logger.info(`🎯 API Base URL: http://localhost:${PORT}/api`);
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
    } else {
        logger.error('Server error:', error);
    }
    process.exit(1);
});

export default app;