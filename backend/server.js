import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import userRoutes from './routes/users.js';
import rewardRoutes from './routes/rewards.js';
import transactionRoutes from './routes/transactions.js';
import errorHandler from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// Load environment variables
dotenv.config();

const app = express();

// Swagger setup
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '10kb' })); // Body parser, reading data from body into req.body

// Apply rate limiting to all routes
app.use('/api', apiLimiter);

// Routes
app.use('/api', userRoutes);
app.use('/api', rewardRoutes);
app.use('/api', transactionRoutes);

// Serve uploads directory for profile images
app.use('/uploads', express.static('backend/uploads'));

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api-docs`);
});
