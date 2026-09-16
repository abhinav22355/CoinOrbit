const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables reliably regardless of where the command was executed
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Initialize Express app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: '*', // Allow requests from any origin (e.g. Vite frontend)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CoinOrbit API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server (Port 5001 avoids conflict with macOS AirPlay Receiver on port 5000)
// Start server locally
if (require.main === module) {
  const PORT = process.env.PORT || 5001;

  const server = app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 [CoinOrbit Server] Active on port ${PORT}`);
    console.log(`🌐 Health endpoint: http://localhost:${PORT}/api/health`);
    console.log(`==================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ [Error] Port ${PORT} is already in use.`);
      console.error(`👉 Try another port in backend/.env\n`);
    } else {
      console.error(`[Server Error]`, err);
    }
  });
}

// Export Express app for Vercel
module.exports = app;
