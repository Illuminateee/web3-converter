import { ethers } from 'ethers';
import { QUOTER_V1_ABI } from '../config/abis.js';
import { QUOTER_V1_ADDRESS, WETH_ADDRESS, FIXED_PRICE_IMPACT } from '../config/constants.js';
import { applyPriceImpact } from '../utils/calculations.js';

export async function getQuote(tokenAddress, poolInfo, tokenDecimals, provider) {
  try {
    // Use QuoterV1 for reliability
    const quoterV1 = new ethers.Contract(QUOTER_V1_ADDRESS, QUOTER_V1_ABI, provider);
    const amountIn = ethers.utils.parseEther('1'); // 1 ETH
    
    const amountOut = await quoterV1.callStatic.quoteExactInputSingle(
      WETH_ADDRESS,
      tokenAddress,
      poolInfo.fee,
      amountIn,
      0
    );
    
    const rawAmount = ethers.utils.formatUnits(amountOut, tokenDecimals);
    const adjustedAmount = applyPriceImpact(rawAmount, FIXED_PRICE_IMPACT);
    
    return {
      rawQuote: rawAmount,
      priceImpact: FIXED_PRICE_IMPACT,
      adjustedQuote: adjustedAmount.toFixed(2),
      tokenPerEth: poolInfo.uniswapFormat,
      quoteFormat: `${adjustedAmount.toFixed(2)} ${poolInfo.tokenIsToken0 ? poolInfo.symbol0 : poolInfo.symbol1}`,
      uniswapFormat: `🔄 ${poolInfo.uniswapFormat} ${poolInfo.tokenIsToken0 ? poolInfo.symbol0 : poolInfo.symbol1} per 1 WETH`
    };
  } catch (error) {
    console.error(`Error getting quote: ${error.message}`);
    throw new Error(`Failed to get quote: ${error.message}`);
  }
}