import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.route.js';
import ticketRoutes from './src/routes/ticket.routes.js';

dotenv.config();
const app = express();

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/tickets', ticketRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

