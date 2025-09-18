# Web3 Token Sale Conversion Price API

A RESTful API service for retrieving Ethereum token information and price quotes from Uniswap V3 pools with 0.01% fee tier.

## Features

- 🔍 **Token Information**: Get basic token details (name, symbol, decimals)
- 💰 **Price Quotes**: Retrieve token prices from Uniswap V3 0.01% fee tier pools
- 🏊‍♂️ **Pool Data**: Access pool information including liquidity and current tick
- ⚡ **Fast Response**: Optimized for quick token price lookups
- 🛡️ **Error Handling**: Comprehensive error handling with detailed responses
- 🌐 **CORS Enabled**: Ready for frontend integration

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Illuminateee/web3-converter.git
   cd web3-tokensale-conversion-price
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   # Create .env file
   PORT=3000
   ```

## Usage

### Starting the Server

**Development mode with auto-reload:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

### API Endpoints

#### Get Token Information and Price Quote

```http
GET /api/token/:address?amount=<eth_amount>
```

**Parameters:**
- `address` (required): Ethereum token contract address (must be a valid 40-character hex address)
- `amount` (optional): Amount of ETH to use for price quote (default: 1 ETH)

**Example Request:**
```bash
curl "http://localhost:3000/api/token/0xA0b86a33E6411a3036D5c4A1F48c6781f5e1bFe4?amount=0.5"
```

**Success Response:**
```json
{
  "success": true,
  "token": {
    "address": "0xA0b86a33E6411a3036D5c4A1F48c6781f5e1bFe4",
    "symbol": "TOKEN",
    "name": "Token Name",
    "decimals": 18
  },
  "pool": {
    "address": "0x...",
    "token0": "0x...",
    "token1": "0x...",
    "fee": 100,
    "tickSpacing": 1,
    "liquidity": "123456789",
    "tick": 12345
  },
  "quote": {
    "success": true,
    "amountIn": "1.0",
    "amountOut": "1234.567890123456789",
    "priceImpact": -47.67,
    "executionPrice": "0.000808080808080808",
    "formattedPrice": "1 ETH = 1,234.57 TOKEN"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid token address"
}
```

#### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

#### API Information

```http
GET /
```

Returns API documentation and available endpoints.

## Project Structure

```
src/
├── index.js              # Main server file and route definitions
├── config/
│   ├── abis.js           # Smart contract ABIs
│   ├── constants.js      # Contract addresses and constants
│   └── providers.js      # Ethereum provider configuration
├── services/
│   ├── poolService.js    # Uniswap V3 pool interactions
│   ├── quoteService.js   # Price quote calculations
│   └── tokenService.js   # Token information and main service logic
└── utils/
    ├── calculations.js   # Price and calculation utilities
    └── helpers.js        # General helper functions
```

## Technical Details

### Supported Networks
- **Ethereum Mainnet** (default)

### Fee Tier
- Uses **0.01% fee tier** pools exclusively for price quotes

### Dependencies
- **Express.js**: Web framework for API endpoints
- **ethers.js**: Ethereum blockchain interaction
- **CORS**: Cross-origin resource sharing support

### Key Features
- Validates Ethereum addresses using regex pattern
- Fetches token metadata (name, symbol, decimals) from ERC-20 contracts
- Queries Uniswap V3 factory for pool existence
- Calculates price quotes using Uniswap V3 Quoter contract
- Handles edge cases and provides detailed error messages

## Error Handling

The API provides comprehensive error handling for:
- Invalid token addresses
- Non-existent tokens
- Missing Uniswap pools
- Network connectivity issues
- Invalid amount parameters

## Examples

### Get USDC price quote for 1 ETH
```bash
curl "http://localhost:3000/api/token/0xA0b73fdB803BfAB98C428B6395A38f6e4daBD50B"
```

### Get token quote for custom ETH amount
```bash
curl "http://localhost:3000/api/token/0xA0b73fdB803BfAB98C428B6395A38f6e4daBD50B?amount=2.5"
```

### Health check
```bash
curl "http://localhost:3000/health"
```

## Development

### Requirements
- Node.js 16+ 
- NPM or Yarn package manager

### Local Development
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. The server will auto-reload on file changes

### Testing
Test the API using curl, Postman, or any HTTP client:

```bash
# Test with a known token address
curl "http://localhost:3000/api/token/0xA0b73fdB803BfAB98C428B6395A38f6e4daBD50B"
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m "Add feature description"`
5. Push to your branch: `git push origin feature-name`
6. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:
1. Check the error messages in the API response
2. Verify the token address is valid and the token exists
3. Ensure the token has a 0.01% fee tier pool on Uniswap V3
4. Open an issue on GitHub with details about the problem

---

**Note**: This API is designed for development and testing purposes. For production use, consider implementing rate limiting, authentication, and additional error monitoring.