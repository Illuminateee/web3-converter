import { ethers } from 'ethers';
import { ERC20_ABI } from '../config/abis.js';
import { getPoolInfo } from './poolService.js';
import { getProvider } from '../config/providers.js';
import { FEE_TIER_0_01, WETH_ADDRESS } from '../config/constants.js';
import { getQuote } from './quoteService.js';

export async function getTokenInfo(tokenAddress, provider) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    const symbol = await tokenContract.symbol();
    const name = await tokenContract.name();
    const decimals = await tokenContract.decimals();
    
    return {
      address: tokenAddress,
      symbol,
      name,
      decimals
    };
  } catch (error) {
    console.error(`Error getting token info: ${error.message}`);
    throw new Error(`Failed to get token info: ${error.message}`);
  }
}

export async function getTokenWithQuote(tokenAddress, amountEth = 1) {
  let tokenInfo = null;
  let poolInfo = null;
  
  try {
    const provider = await getProvider();
    
    // Get token basic info
    tokenInfo = await getTokenInfo(tokenAddress, provider);
    
    // Get pool info for the 0.01% fee tier
    poolInfo = await getPoolInfo(tokenAddress, FEE_TIER_0_01, provider);
    
    if (!poolInfo) {
      throw new Error(`No 0.01% pool found for ${tokenInfo.symbol}`);
    }
    
    // Get quote data with custom ETH amount
    const quoteData = await getQuote(tokenAddress, poolInfo, tokenInfo.decimals, provider, amountEth);
    
    // Check if the quote had an error
    if (quoteData.success === false) {
      return {
        success: true, // Still return success as we have token and pool info
        token: tokenInfo,
        pool: poolInfo,
        quote: quoteData
      };
    }
    
    return {
      success: true,
      token: tokenInfo,
      pool: poolInfo,
      quote: quoteData
    };
  } catch (error) {
    console.error(`Error processing token: ${error.message}`);
    return {
      success: false,
      error: error.message,
      token: tokenInfo,  // Return what we have, even if incomplete
      pool: poolInfo
    };
  }
}