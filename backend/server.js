import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './src/routes/auth.route.js';
import ticketRoutes from './src/routes/ticket.routes.js';
import multer from 'multer';
import dashboardRoutes from './src/routes/dashboard.route.js';
import organizationRoutes from './src/routes/organization.route.js';
import { errorMiddleware } from './src/middleware/error.middleware.js';
import { globalRateLimit } from './src/middleware/ratelimit.middleware.js';
import morgan from 'morgan';
import { seedSuperAdmin } from './src/utils/seed.js';

dotenv.config();
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));
app.use(globalRateLimit);
app.use('/auth', authRoutes);
app.use('/tickets', ticketRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/dashboard", dashboardRoutes);
app.use("/organizations", organizationRoutes);
app.use(errorMiddleware);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message, field: err.field });
  }
  if (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Something went wrong' });
  }
  next();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedSuperAdmin();
});

