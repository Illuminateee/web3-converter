import express from 'express';
import cors from 'cors';
import { getTokenWithQuote } from './services/tokenService.js';

const app = express();
app.use(cors());
app.use(express.json());

// GET endpoint for getting token quote
app.get('/api/token/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { amount } = req.query;
    
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token address'
      });
    }
    
    // Parse amount if provided, default to 1 ETH
    let parsedAmount = 1;
    if (amount) {
      parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid amount parameter. Must be a positive number.'
        });
      }
    }
    
    const result = await getTokenWithQuote(address, parsedAmount);
    res.json(result);
  } catch (error) {
    console.error(`API error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

// Default route
app.get('/', (_, res) => {
  res.json({
    name: 'Token Price API',
    endpoints: [
      {
        path: '/api/token/:address',
        method: 'GET',
        description: 'Get token info with price from 0.01% pool',
        query: 'Optional: amount=<number> (ETH amount for quote)'
      },
      {
        path: '/health',
        method: 'GET',
        description: 'Health check endpoint'
      }
    ]
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});