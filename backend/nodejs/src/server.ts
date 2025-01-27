import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { errorHandler } from '@/middleware/errorHandler';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { networkRoutes } from './routes/network.routes';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/network', networkRoutes);

// Error handling
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wol')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
