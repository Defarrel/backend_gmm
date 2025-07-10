const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const transactionRoutes = require('./routes/transactions');
const pensionRoutes = require('./routes/pensiun');
const savingsRoutes = require('./routes/savings');
const userRoutes = require('./routes/user');
const invtRoutes = require('./routes/invt');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/pensiun', pensionRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/invitations', invtRoutes);
app.use('/api', userRoutes); 



// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
