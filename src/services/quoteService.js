import { ethers } from 'ethers';
import { QUOTER_V1_ABI } from '../config/abis.js';
import { QUOTER_V1_ADDRESS, WETH_ADDRESS, FIXED_PRICE_IMPACT } from '../config/constants.js';
import { applyPriceImpact } from '../utils/calculations.js';

export async function getQuote(tokenAddress, poolInfo, tokenDecimals, provider, amountEth = 1) {
  try {
    // Use QuoterV1 for reliability
    const quoterV1 = new ethers.Contract(QUOTER_V1_ADDRESS, QUOTER_V1_ABI, provider);
    
    // Try with different amounts if the requested amount fails
    let amountOut;
    let usedAmount = amountEth;
    const testAmounts = [amountEth, 0.1, 0.01]; // Try original amount, then smaller fallbacks
    
    for (const testAmount of testAmounts) {
      try {
        const amountIn = ethers.utils.parseEther(testAmount.toString());
        amountOut = await quoterV1.callStatic.quoteExactInputSingle(
          WETH_ADDRESS,
          tokenAddress,
          poolInfo.fee,
          amountIn,
          0
        );
        
        // If we're using a fallback amount, scale the result to match the requested amount
        if (testAmount !== amountEth) {
          const scaleFactor = amountEth / testAmount;
          amountOut = amountOut.mul(Math.floor(scaleFactor * 1000)).div(1000);
          console.log(`Quote succeeded with ${testAmount} ETH (scaled by ${scaleFactor})`);
        } else {
          console.log(`Quote succeeded with original amount: ${amountEth} ETH`);
        }
        
        usedAmount = testAmount;
        break; // Exit loop if successful
      } catch (quoteError) {
        console.warn(`Quote failed with ${testAmount} ETH: ${quoteError.message}`);
        
        // If this is the last amount to try, handle the failure
        if (testAmount === testAmounts[testAmounts.length - 1]) {
          // Use spot price calculation as final fallback
          console.log(`All quote attempts failed, using spot price from pool`);
          
          // Determine the amount based on spot price from the pool
          const spotPricePerEth = parseFloat(poolInfo.uniswapFormat.replace(/,/g, ''));
          const estimatedTokens = spotPricePerEth * amountEth;
          
          // Format the result as a string with the appropriate decimals
          const formattedAmount = ethers.utils.parseUnits(
            estimatedTokens.toFixed(tokenDecimals),
            tokenDecimals
          );
          
          amountOut = formattedAmount;
          usedAmount = "spot price";
          break;
        }
      }
    }
    
    const rawAmount = ethers.utils.formatUnits(amountOut, tokenDecimals);
    const adjustedAmount = applyPriceImpact(rawAmount, FIXED_PRICE_IMPACT);
    
    return {
      ethAmount: amountEth,
      quotingMethod: usedAmount === amountEth ? "direct" : usedAmount === "spot price" ? "spot price" : "scaled",
      usedAmount: usedAmount,
      rawQuote: rawAmount,
      priceImpact: FIXED_PRICE_IMPACT,
      adjustedQuote: adjustedAmount.toFixed(2),
      tokenPerEth: poolInfo.uniswapFormat,
      quoteFormat: `${adjustedAmount.toFixed(2)} ${poolInfo.tokenIsToken0 ? poolInfo.symbol0 : poolInfo.symbol1}`,
      uniswapFormat: `🔄 ${poolInfo.uniswapFormat} ${poolInfo.tokenIsToken0 ? poolInfo.symbol0 : poolInfo.symbol1} per ${amountEth} WETH`
    };
  } catch (error) {
    console.error(`Error getting quote: ${error.message}`);
    
    // Return a graceful error with pool information
    return {
      success: false,
      ethAmount: amountEth,
      error: `Quote unavailable: ${error.message}`,
      tokenPerEth: poolInfo.uniswapFormat,
      quoteFormat: `Unable to quote for ${poolInfo.tokenIsToken0 ? poolInfo.symbol0 : poolInfo.symbol1}`,
      uniswapFormat: `🔄 ${poolInfo.uniswapFormat} ${poolInfo.tokenIsToken0 ? poolInfo.symbol0 : poolInfo.symbol1} per WETH (spot price)`
    };
  }
}