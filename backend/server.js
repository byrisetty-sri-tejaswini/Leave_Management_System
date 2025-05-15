import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// CORS - Correct configuration
app.use(cors({
  origin: 'http://localhost:3000', // Your React app's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Mock database
let leaves = [];

// API Endpoints
app.get('/api/leaves', (req, res) => {
  res.json(leaves);
});

app.get('/api/leaves/:userId', (req, res) => {
  const userLeaves = leaves.filter(leave => leave.userId === req.params.userId);
  res.json(userLeaves);
});

app.post('/api/leaves', (req, res) => {
  try {
    const leaveRequest = {
      id: Date.now(),
      ...req.body,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    leaves.push(leaveRequest);
    res.status(201).json(leaveRequest);
  } catch (error) {
    console.error('Error creating leave:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});