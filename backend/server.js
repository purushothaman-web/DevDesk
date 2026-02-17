import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.route.js';
import ticketRoutes from './src/routes/ticket.routes.js';
import multer from 'multer';

dotenv.config();
const app = express();

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/tickets', ticketRoutes);
app.use("/uploads", express.static("uploads"));

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

