const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const { initDatabase } = require('./db/database');

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`RORAC API Server running on port ${PORT}`);
});
